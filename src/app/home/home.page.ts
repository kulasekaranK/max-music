import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonContent, IonButton, IonLabel, IonList, IonToggle, IonItem,
  IonIcon, IonThumbnail, IonSkeletonText, IonButtons, IonFooter,
  IonNote, IonModal, IonSearchbar, IonSelect, IonSelectOption, IonAvatar, IonChip, IonItemSliding, IonItemOptions, IonItemOption, IonReorderGroup, IonReorder, IonProgressBar, IonBadge, IonPopover, IonCardContent, IonCard, IonCardHeader, IonText, IonCol, IonRow, IonGrid, IonRange, IonSpinner
} from '@ionic/angular/standalone';
import { FirestoreService } from '../services/firebase-service.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';
import { trigger, transition, style, animate, state, query, stagger } from '@angular/animations';
import { addIcons } from 'ionicons';
import { search, play, trash } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonText, IonCardHeader, IonCard, IonCardContent, IonPopover, IonProgressBar, IonReorder, IonReorderGroup, IonChip, IonAvatar, IonSearchbar, IonModal, IonFooter, IonButtons, IonSkeletonText, IonIcon, IonItem,
    IonList, IonLabel, IonButton, IonHeader, IonToolbar, IonContent, IonThumbnail, IonSelect,
    CommonModule, FormsModule, IonSelectOption, IonRange, IonSpinner],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ]),
    trigger('cardHover', [
      state('normal', style({
        transform: 'scale(1)'
      })),
      state('hover', style({
        transform: 'scale(1.03)'
      })),
      transition('normal <=> hover', [
        animate('200ms ease-in-out')
      ])
    ]),
    trigger('slideUp', [
      state('in', style({
        transform: 'translateY(0)'
      })),
      state('out', style({
        transform: 'translateY(100%)'
      })),
      transition('out <=> in', [
        animate('300ms ease-out')
      ])
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class HomePage {
  homePageSongs: any[] = [];
  audio = new Audio();
  currentSong: any = null;
  currentIndex: number = 0;
  isPlaying: boolean = false;
  currentTime: number = 0;
  duration: number = 0;

  isShuffle = true;
  isLiked = false;

  isModalOpen: boolean = false;
  isSearch = false;
  isLikedSongsModal = false;
  searchQuaery: string = '';
  subscribe: any;
  isSettings = false;
  selectedQuality = 3;
  streamQuality = 'Ultra (320kbps)';
  qualityOptions = [
    { value: 0, label: 'Very Low (12kbps)' },
    { value: 1, label: 'Low (48kbps)' },
    { value: 2, label: 'Medium (96kbps)' },
    { value: 3, label: 'High (160kbps)' },
    { value: 4, label: 'Ultra (320kbps)' },
  ];
  paletteToggle = false;
  trending = false;
  isDevUser = false;
  currentUser: any;



  constructor(
    private cdr: ChangeDetectorRef,
    private firebaseService: FirestoreService,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {
    addIcons({ search, play, trash });
    const devUID = 'vTGcqrdSIdfuK8mqbl8EIuSxhD92';

    this.authService.getCurrentUser().then((user: any) => {
      this.currentUser = user;
      console.log('auth', user);

      if (user && user.uid) {
        this.isDevUser = user.uid === devUID;
      } else {
        this.isDevUser = false;
      }
    });


    this.init();
    this.loadQuality();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    this.initializeDarkPalette(prefersDark.matches);

    prefersDark.addEventListener('change', (event) =>
      this.initializeDarkPalette(event.matches)
    );
  }
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  getRandomWaveHeight() {
    return Math.floor(Math.random() * 20) + 10;
  }
  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }


  initializeDarkPalette(isDark: boolean) {
    this.paletteToggle = isDark;
    this.toggleDarkPalette(isDark);
  }

  toggleChange(ev: CustomEvent) {
    this.toggleDarkPalette(ev.detail.checked);
  }

  toggleDarkPalette(shouldAdd: boolean) {
    document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
  }
  async logout() {
    await this.authService.logout();
    // Optionally redirect to login
    window.location.href = '/login';
  }
  likedSongLoading = true;
  async init() {
    if (!this.isSearch && this.isLikedSongsModal) {
      this.homePageSongs = [];

      if (this.isDevUser) {
        // 🔒 Firestore liked songs
        this.subscribe = this.firebaseService.getCollectionData('likedSongs').subscribe(data => {
          this.homePageSongs.push(data);
          this.likedSongLoading = false;
          this.cdr.detectChanges();
        });
      } else {
        // 🔓 LocalStorage liked songs
        const likedSongs = JSON.parse(localStorage.getItem('likedSongs') || '[]');
        this.homePageSongs.push(likedSongs);
        this.likedSongLoading = false;
        this.cdr.detectChanges();
      }
    } else {
      const query = this.isSearch ? this.searchQuaery : (this.trending ? 'hits' : 'hits(tamil)');
      fetch(`https://saavn.dev/api/search/songs?query=${query}&limit=250`)
        .then(response => response.json())
        .then(songs => {
          this.homePageSongs = [];
          this.homePageSongs.push(songs?.data?.results);
          this.cdr.detectChanges()
          console.log("Tamil Trending Songs:", this.homePageSongs);
        })
        .catch(error => console.error("Error fetching songs:", error));
    }

  }



  ngOnDestry() {
    this.subscribe.unSubscribe();
  }
  async playSong(song: any, index: any) {
    if (!song) return;
    if (this.isDevUser) {
      this.isLiked = await this.firebaseService.isSongLiked(song.id);
    } else {
      const likedSongs: any[] = JSON.parse(localStorage.getItem('likedSongs') || '[]');
      this.isLiked = likedSongs.some((s: any) => s.id === song.id);
    }
    this.isLiked = await this.firebaseService.isSongLiked(song.id);

    this.currentSong = song;
    this.currentIndex = index;
    this.audio.src = song.downloadUrl[this.selectedQuality].url;
    this.audio.play();
    this.isPlaying = true;

    // Update Duration
    this.audio.onloadedmetadata = () => {
      this.duration = this.audio.duration;
    };

    // Update Current Time
    this.audio.ontimeupdate = () => {
      this.currentTime = this.audio.currentTime;
    };

    // Auto-play next song when current song ends
    this.audio.onended = () => {
      this.autoNextSong();
    };
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play();
    }
    this.isPlaying = !this.isPlaying;
  }
  nextSong() {
    // First, check if queue has songs
    if (this.queue.length > 0) {
      const nextQueuedSong = this.queue.shift(); // take 1st from queue
      const index = this.homePageSongs[0].findIndex((s: any) => s.id === nextQueuedSong.id);
      this.playSong(nextQueuedSong, index);
    }
    // Else fallback to shuffle or normal next
    else if (this.isShuffle) {
      this.playRandomSong();
    }
    else if (this.currentIndex < this.homePageSongs[0].length - 1) {
      this.playSong(this.homePageSongs[0][this.currentIndex + 1], this.currentIndex + 1);
    }
  }


  prevSong() {
    if (this.currentIndex > 0) {
      this.playSong(this.homePageSongs[0][this.currentIndex - 1], this.currentIndex - 1);
    }
  }

  seekSong(event: any) {
    this.audio.currentTime = event.detail.value;
  }

  formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  queue: any[] = [];

  addToQueue(song: any) {
    // Avoid duplicate
    if (!this.queue.some(q => q.id === song.id)) {
      this.queue.push(song);
      console.log('Added to Queue:', song.name);
    } else {
      console.log('Already in Queue:', song.name);
    }
  }
  removeFromQueue(index: number) {
    this.queue.splice(index, 1);
  }
  handleReorder(event: CustomEvent) {
    const from = event.detail.from;
    const to = event.detail.to;

    const movedItem = this.queue.splice(from, 1)[0];
    this.queue.splice(to, 0, movedItem);

    event.detail.complete(); // 👈 necessary to complete the reorder action
  }



  autoNextSong() {
    if (this.queue.length > 0) {
      const nextQueuedSong = this.queue.shift(); // take first from queue
      const index = this.homePageSongs[0].findIndex((s: any) => s.id === nextQueuedSong.id);
      this.playSong(nextQueuedSong, index);
    } else if (this.isShuffle) {
      this.playRandomSong();
    } else {
      this.nextSong();
    }
  }


  // Play a random song
  playRandomSong() {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * this.homePageSongs[0].length);
    } while (randomIndex === this.currentIndex);

    this.playSong(this.homePageSongs[0][randomIndex], randomIndex);
  }

  // Toggle shuffle mode
  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    console.log('Shuffle Mode:', this.isShuffle);
  }

  async toggleLikeSong(song: any) {
    if (!song) return;

    if (this.isDevUser) {
      console.log('true');

      if (this.isLiked) {
        await this.firebaseService.unlikeSong(song.id);
      } else {
        await this.firebaseService.likeSong(song);
      }
    } else {
      // Use localStorage for public users – store full song object
      const likedSongs: any[] = JSON.parse(localStorage.getItem('likedSongs') || '[]');

      if (this.isLiked) {
        // Remove song by ID
        const updated = likedSongs.filter((s: any) => s.id !== song.id);
        localStorage.setItem('likedSongs', JSON.stringify(updated));
      } else {
        // Push full song object if not already liked
        likedSongs.push(song);
        localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
      }
    }

    this.isLiked = !this.isLiked;
  }



  async checkIfLiked(song: any) {
    if (!song) return;

    if (this.isDevUser) {
      console.log('true');
      this.isLiked = await this.firebaseService.isSongLiked(song.id);
    } else {
      console.log('true0');
      const likedSongs = JSON.parse(localStorage.getItem('likedSongs') || '[]');
      this.isLiked = likedSongs.some((s: any) => s.id === song.id);
    }
  }



  openModal() {
    this.isModalOpen = true;
  }
  closeModal() {
    this.isModalOpen = false;
    if (this.isSearch) {
      this.isSearch = false;
      this.init();
      this.searchQuaery = '';
    }
    if (this.isLikedSongsModal) {
      this.isLikedSongsModal = false;
      this.init();
    }
    this.isSettings = false;
  }


  async loadQuality() {
    if (this.isDevUser) {
      const quality = await this.firebaseService.getQuality();
      if (quality) {
        this.selectedQuality = quality.value;
        this.streamQuality = quality.label;
      }
    } else {
      const value = localStorage.getItem('qualityValue');
      const label = localStorage.getItem('qualityLabel');
      if (value && label) {
        this.selectedQuality = parseInt(value);
        this.streamQuality = label;
      }
    }
    this.cdr.detectChanges();
  }


  async changeQuality(event: any) {
    const selectedValue = event.detail.value;
    console.log('event', selectedValue)
    const selectedLabel = this.qualityOptions.find((q) => q.value === selectedValue)?.label || '';
    this.selectedQuality = selectedValue;
    this.streamQuality = selectedLabel;

    if (this.isDevUser) {
      await this.firebaseService.saveQuality(selectedValue, selectedLabel);
    } else {
      console.log("work")
      localStorage.setItem('qualityValue', selectedValue.toString());
      localStorage.setItem('qualityLabel', selectedLabel);
    }

    this.cdr.detectChanges();
  }


}


