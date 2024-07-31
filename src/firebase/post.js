import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  where,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';

// Function to get posts from Firestore and cache them
export const fetchPostsWithComments = (callback) => {
  const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
  
  // Check if cached posts exist in localStorage
  const cachedPosts = JSON.parse(localStorage.getItem('cachedPosts')) || [];
  callback(cachedPosts); // Initially load cached posts if available
  
  onSnapshot(q, async (snapshot) => {
    const posts = [];
    for (const doc of snapshot.docs) {
      const post = { ...doc.data(), id: doc.id };
      const commentsSnapshot = await getDocs(collection(db, `posts/${post.id}/comments`));
      post.comments = commentsSnapshot.docs.map(commentDoc => ({ ...commentDoc.data(), id: commentDoc.id }));
      posts.push(post);
    }
    // Update cached posts in localStorage
    localStorage.setItem('cachedPosts', JSON.stringify(posts));
    callback(posts); // Update UI with the latest posts
  });
};

export const createPost = async (userUid, content, imageFiles,userType) => {
  let userDetails;

  const doctorsQuery = query(collection(db, 'doctors'), where("uid", "==", userUid));
  const doctorsSnapshot = await getDocs(doctorsQuery);

  const mothersQuery = query(collection(db, 'mothers'), where("uid", "==", userUid));
  const mothersSnapshot = await getDocs(mothersQuery);

  if (!doctorsSnapshot.empty) {
    userDetails = doctorsSnapshot.docs[0].data();
  } else if (!mothersSnapshot.empty) {
    userDetails = mothersSnapshot.docs[0].data();
  } else {
    throw new Error('User details not found');
  }

  let post = {
    uid: userUid,
    content: content,
    firstName: userDetails.firstName,
    secondName: userDetails.secondName,
    role: userType,
    timestamp: serverTimestamp(),
  };

  if (imageFiles.length > 0) {
    const fileUrls = await Promise.all(
      imageFiles.map(async (file) => {
        const storageRef = ref(storage, `images/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      })
    );
    post.imageUrls = fileUrls;
  }

  await addDoc(collection(db, 'posts'), post);
};

export const addComment = async (postId, comment) => {
  // Add comment to Firestore
  await addDoc(collection(db, `posts/${postId}/comments`), {
    comment: comment,
    timestamp: serverTimestamp(),
  });
};

export const deletePost = async (postId) => {
  const postRef = doc(collection(db, 'posts'), postId);
  await deleteDoc(postRef);
};

export const deleteComment = async (commentId) => {
  const commentRef = doc(collection(db, 'comments'), commentId); // Adjust path if necessary
  await deleteDoc(commentRef);
};
export const savePostForUser = async (userId, postId) => {
  const userRef = doc(db, 'savedPosts', userId);  // Correct way to get a document reference

  try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
          const savedPosts = docSnap.data().posts || [];
          if (!savedPosts.includes(postId)) {
              savedPosts.push(postId);
              await updateDoc(userRef, { posts: savedPosts });
          }
      } else {
          await setDoc(userRef, { posts: [postId] });
      }
  } catch (error) {
      console.error('Error saving post:', error);
      throw error;
  }
};

export const unsavePostForUser = async (userId, postId) => {
  const userRef = doc(db, 'savedPosts', userId);  // Correct way to get a document reference

  try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
          const savedPosts = docSnap.data().posts || [];
          const updatedPosts = savedPosts.filter(id => id !== postId);
          await updateDoc(userRef, { posts: updatedPosts });
      }
  } catch (error) {
      console.error('Error unsaving post:', error);
      throw error;
  }
};

export const fetchSavedPosts = (userId, callback) => {
  if (!userId) {
      console.error('User ID is undefined.');
      return;
  }

  const userRef = doc(db, 'savedPosts', userId);
  onSnapshot(userRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
          const postIds = docSnapshot.data().posts || [];
          const posts = await Promise.all(postIds.map(async (postId) => {
              const postDoc = await getDoc(doc(db, 'posts', postId));
              return { id: postId, ...postDoc.data() };
          }));
          callback(posts);
      } else {
          callback([]);
      }
  }, (error) => {
      console.error('Error fetching saved posts:', error);
  });
};

// Function to fetch a single post by ID
// export const fetchPostById = async (postId) => {
//   try {
//       const postRef = db.collection('posts').doc(postId);
//       const doc = await postRef.get();

//       if (doc.exists) {
//           // Document exists, return the data
//           return doc.data();
//       } else {
//           // Document does not exist
//           console.error('No such post document!');
//           return null;
//       }
//   } catch (error) {
//       // Error fetching post
//       console.error('Error fetching post:', error);
//       throw error; // Optionally handle the error or throw it to handle higher up
//   }
// };

export async function fetchPostById(id) {
  try {
    const postRef = doc(db, 'posts', id);
    const postSnapshot = await getDoc(postRef);

    if (postSnapshot.exists()) {
      return { id: postSnapshot.id, ...postSnapshot.data() };
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}