import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, deleteDoc, getDoc, docData, collectionData, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  // ✅ Add Data to Firestore
  addDocument(collectionName: string, data: any) {
    const colRef = collection(this.firestore, collectionName);
    return addDoc(colRef, data);
  }

  // ✅ Update Data in Firestore
  updateDocument(path: string, updatedData: any) {
    const docRef = doc(this.firestore, `${path}`);
    return updateDoc(docRef, updatedData);
  }

  // ✅ Delete Data from Firestore
  deleteDocument(collectionName: string, docId: string) {
    const docRef = doc(this.firestore, `${collectionName}/${docId}`);
    return deleteDoc(docRef);
  }

  // ✅ Get Single Document Data
  getDocumentData(path: string): Observable<any> {
    const docRef = doc(this.firestore, `${path}`);
    return docData(docRef, { idField: 'id' });
  }

  // ✅ Get All Documents in a Collection (Real-time)
  getCollectionData(collectionName: string): Observable<any[]> {
    const colRef = collection(this.firestore, collectionName);
    return collectionData(colRef, { idField: 'id' });
  }

  async isSongLiked(songId: string): Promise<boolean> {
    const songRef = doc(this.firestore, `likedSongs/${songId}`);
    const songSnap = await getDoc(songRef);
    return songSnap.exists();
  }

    // Function to like a song
    async likeSong(song: any) {
      const songRef = doc(this.firestore, `likedSongs/${song.id}`);
      await setDoc(songRef, song); // Save song to Firestore
    }
  
    // Function to unlike a song
    async unlikeSong(songId: string) {
      const songRef = doc(this.firestore, `likedSongs/${songId}`);
      await deleteDoc(songRef); // Remove song from Firestore
    }

    async saveQuality(value: number, label: string) {
      const qualityRef = doc(this.firestore, 'quality/selected');
      await setDoc(qualityRef, { value, label });
    }
  
    // Get selected quality from Firestore
    async getQuality(): Promise<{ value: number; label: string } | null> {
      const qualityRef = doc(this.firestore, 'quality/selected');
      const qualitySnap = await getDoc(qualityRef);
      return qualitySnap.exists() ? (qualitySnap.data() as { value: number; label: string }) : null;
    }
}
