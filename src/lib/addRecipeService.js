import {
  addDoc,
  collection,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";

/**
 * Delete Functionality
 */
export async function deleteRecipeById(id) {
  await deleteDoc(doc(db, "recipes", id));
}
/**
 * Uploads an image file to Firebase Storage and returns its download URL.
 */
export async function uploadRecipeImageFile(file) {
  if (!file) return "";

  const safeName = file.name.replace(/[^\w.-]+/g, "_");
  const path = `recipes/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

/**
 * Creates a recipe document in Firestore (collection: "recipes").
 */
export async function createRecipe(recipe) {
  const refCol = collection(db, "recipes");
  const payload = {
    ...recipe,
    // Ensure both rating fields are included
    avgUserRating: recipe.avgUserRating || 0,
    adminReviewScore: recipe.adminReviewScore || 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(refCol, payload);
  return docRef.id;
}
