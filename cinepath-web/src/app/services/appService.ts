import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, query, doc, setDoc, getDocs, deleteDoc, collectionData, DocumentData } from '@angular/fire/firestore';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from '@angular/fire/auth';
import { User } from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})

export class AppService {
  private user = new BehaviorSubject<User | null>(null);

  constructor(private firestore: Firestore, private auth: Auth) {
    // Inicializa o BehaviorSubject com o usuário atual, se houver
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.user.next(user);
      } else {
        this.user.next(null);
      }
    });
  }

  get user$(): Observable<User | null> {
    return this.user.asObservable();
  }
  // begin ReviewService
  // async addReview(review: IReview): Promise<void> {
  //   const reviewDoc = await addDoc(collection(this.firestore, 'reviews'), review);
  // }

  // async addMockReview(): Promise<void> {
  //   // const review: IReview = {
  //   //   id: '1',
  //   //   mediaType: 'movie',
  //   //   mediaId: 823464,
  //   //   rating: 5,
  //   //   review: 'Great movie!',
  //   //   createdAt: new Date()
  //   // };
  //   // await addDoc(collection(this.firestore, 'reviews'), review);
  // }

  // getReviews(): Observable<IReview[]> {
  //   const reviewsCollection = collection(this.firestore, 'reviews');
  //   const reviews = collectionData(reviewsCollection, {idField: 'id'}).pipe(
  //     map(reviews => reviews.map(review => createReview(review as IReview)))
  //   );
  //   return reviews;
  // }

  // async deleteReview(reviewId: string): Promise<void> {
  //   await deleteDoc(doc(this.firestore, 'reviews', reviewId));
  // }

  // async updateReview(reviewId: string, review: IReview): Promise<void> {
  //   await setDoc(doc(this.firestore, 'reviews', reviewId), review);
  // }

  // async getReview(reviewId: string): Promise<IReview> {
  //   const review = await getDocs(query(collection(this.firestore, 'reviews')));
  //   const reviewData = review.docs.find(doc => doc.id === reviewId);
  //   if (reviewData) {
  //     return createReview(reviewData.data() as IReview);
  //   } else {
  //     throw new Error('Review not found');
  //   }
  // }
  // end ReviewService

  // begin AuthService 
  async registerUser(email: string, password: string): Promise<boolean> {
    console.log('registerUser');
    console.log(email);
    console.log(password);
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      this.user.next(userCredential.user);
      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    }
  }

  async loginUser(email: string, password: string): Promise<boolean> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      this.user.next(userCredential.user);
      return true;
    } catch (error) {
      console.error('Error logging in user:', error);
      return false;
    }
  }

  async logoutUser(): Promise<void> {
    try {
      await signOut(this.auth);
      this.user.next(null);
    } catch (error) {
      console.error('Error logging out user:', error);
    }
  }


  // end AuthService


  //begin userFavoritesService
  async addFavorite(mediaType: string, mediaId: number): Promise<void> {
    const user = this.user.value;
    console.log(user);
    if (user) {
      const favoritesCollection = collection(this.firestore, 'users', user.uid, 'favorites');
      try {
        let teste = await addDoc(favoritesCollection, {mediaType, mediaId});
        console.log('Favorite added');
        console.log(teste);
      }catch (error) {
        console.error('Error adding favorite:', error);
      }
    }
  }

  async getFavorites(): Promise<{mediaType: string, mediaId: number}[]> {
    const user = this.user.value;
    if (user) {
      const favoritesCollection = collection(this.firestore, 'users', user.uid, 'favorites');
      const favorites = await getDocs(favoritesCollection);
      return favorites.docs.map(doc => doc.data() as {mediaType: string, mediaId: number});
    } else {
      return [];
    }
  }
  
  async removeFavorite(mediaType: string, mediaId: number): Promise<void> {
    const user = this.user.value;
    if (user) {
      const favoritesCollection = collection(this.firestore, 'users', user.uid, 'favorites');
      const favorites = await getDocs(favoritesCollection);
      const favoriteDoc = favorites.docs.find(doc => doc.data()['mediaType'] === mediaType && doc.data()['mediaId'] === mediaId);
      if (favoriteDoc) {
        await deleteDoc(doc(favoritesCollection, favoriteDoc.id));
      }
    }
  }

  async isFavorite(mediaType: string, mediaId: number): Promise<boolean> {
    const user = this.user.value;
    if (user) {
      const favoritesCollection = collection(this.firestore, 'users', user.uid, 'favorites');
      const favorites = await getDocs(favoritesCollection);
      return favorites.docs.some(doc => doc.data()['mediaType'] === mediaType && doc.data()['mediaId'] === mediaId);
    } else {
      return false;
    }
  }

  //end userFavoritesService


  //begin userWatchlistService
  async addWatchlist(mediaType: string, mediaId: number): Promise<void> {
    const user = this.user.value;
    if (user) {
      const watchlistCollection = collection(this.firestore, 'users', user.uid, 'watchlist');
      try {
        await addDoc(watchlistCollection, {mediaType, mediaId});
      } catch (error) {
        console.error('Error adding watchlist:', error);
      }
    }
  }

  async getWatchlist(): Promise<{mediaType: string, mediaId: number}[]> {
    const user = this.user.value;
    if (user) {
      const watchlistCollection = collection(this.firestore, 'users', user.uid, 'watchlist');
      const watchlist = await getDocs(watchlistCollection);
      return watchlist.docs.map(doc => doc.data() as {mediaType: string, mediaId: number});
    } else {
      return [];
    }
  }

  async removeWatchlist(mediaType: string, mediaId: number): Promise<void> {
    const user = this.user.value;
    if (user) {
      const watchlistCollection = collection(this.firestore, 'users', user.uid, 'watchlist');
      const watchlist = await getDocs(watchlistCollection);
      const watchlistDoc = watchlist.docs.find(doc => doc.data()['mediaType'] === mediaType && doc.data()['mediaId'] === mediaId);
      if (watchlistDoc) {
        await deleteDoc(doc(watchlistCollection, watchlistDoc.id));
      }
    }
  }

  async isWatchlist(mediaType: string, mediaId: number): Promise<boolean> {
    const user = this.user.value;
    if (user) {
      const watchlistCollection = collection(this.firestore, 'users', user.uid, 'watchlist');
      const watchlist = await getDocs(watchlistCollection);
      return watchlist.docs.some(doc => doc.data()['mediaType'] === mediaType && doc.data()['mediaId'] === mediaId);
    } else {
      return false;
    }
  }

  //end userWatchlistService


  //begin bookmarkService
  async addBookmark(mediaType: string, mediaId: number): Promise<void> {
    const user = this.user.value;
    if (user) {
      const bookmarksCollection = collection(this.firestore, 'users', user.uid, 'bookmarks');
      try {
        await addDoc(bookmarksCollection, {mediaType, mediaId});
      } catch (error) {
        console.error('Error adding bookmark:', error);
      }
    }
  }

  async getBookmarks(): Promise<{mediaType: string, mediaId: number, timestamp: number}[]> {
    const user = this.user.value;
    if (user) {
      const bookmarksCollection = collection(this.firestore, 'users', user.uid, 'bookmarks');
      const bookmarks = await getDocs(bookmarksCollection);
      return bookmarks.docs.map(doc => doc.data() as {mediaType: string, mediaId: number, timestamp: number});
    } else {
      return [];
    }
  }
  

  async removeBookmark(mediaType: string, mediaId: number): Promise<void> {
    const user = this.user.value;
    if (user) {
      const bookmarksCollection = collection(this.firestore, 'users', user.uid, 'bookmarks');
      const bookmarks = await getDocs(bookmarksCollection);
      const bookmarkDoc = bookmarks.docs.find(doc => doc.data()['mediaType'] === mediaType && doc.data()['mediaId'] === mediaId);
      if (bookmarkDoc) {
        await deleteDoc(doc(bookmarksCollection, bookmarkDoc.id));
      }
    }
  }

  async isBookmark(mediaType: string, mediaId: number): Promise<boolean> {
    const user = this.user.value;
    if (user) {
      const bookmarksCollection = collection(this.firestore, 'users', user.uid, 'bookmarks');
      const bookmarks = await getDocs(bookmarksCollection);
      return bookmarks.docs.some(doc => doc.data()['mediaType'] === mediaType && doc.data()['mediaId'] === mediaId);
    } else {
      return false;
    }
  }


  //end bookmarkService
}


