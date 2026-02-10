# Elevated Fuel

Elevated Fuel was built with 1 purpose in mind, to take a bunch of currated videos that have been saved on multiple platforms (Instagram, Youtube, TikTok, Websites, Facebook, Etc.) and allow me to centralize them to one location.

I can then favorite the ones I like, quick search with names, tags, macros and quickly add to my favorites of ones I love or add to my meal plan.

The meal plan allows me to quickly see what I have planned for the week.

Future plans are to add in shopping list from ingredients, pull recipes automatically from links to reduce manually entry.

## Existing Functuality

1. Login / Register Functionality
   - Users own Favorites
   - Users own Meal Plan
2. Browse Recipe Catalog
   - Filter on Name
   - Filter on Tags
   - Filter on Macros (Calories, Proteins, Carbs, Fats)
   - Shows Avg User Rating and Admin Rating
3. Add Recipes
   - Give Personal Rating / Feedback if Made
4. View Recipe
   - View Direct Link of Source
   - Add To Meal Plan
   - Add To Favorites
5. Favorites
   - Delete From Favorites
6. Meal Planner
   - Drag Recipes To Respective Day / Slot (Breakfast, Snacks, Lunch, Dinner, Dessert)
   - Quick View of Recipe
   - Delete From Meal Plan Day / All Together

## Future Development Goals

1. Make Better UI/UX Improvements for Mobile
2. Admin
   - Quickly Pullback Pending Submissoins (Verify No Junk Added)
     - Approve / Reject Submissions
3. Pages
   - Shopping List
   - Recommend Items (Food Scale/Anything Else)
   - Settings
     - Link Family Member (Shared Meal Plan/Favorites)
     - Change Name / Other Settings
     - Make a Suggestion
4. Advanced Filter
   - Better UI/UX For Advanced Filter
5. Recipe Cards
   - If a link is provided on the recipe, show a 'Eye' icon that they can click on that will take them straight to the link on the recipe card rather than having to go inside the recipe to see if they want to try it
6. Add Recipe
   - If link provided, try to scrape directions and ingredients
   - Add custom image for card
7. View Recipe
   - Add Ingredients To Shopping List
8. Meal Plan
   - Under Date, summarize the P/C/F for all meals for that day

# Contributing

## Local Dev

1. Pull project down to local folder
2. Install local modules needed to run by running the command: **npm install**
3. Create inside the main folder a file named **.env.local**
4. Add these values to your **.env.local** file and populate with your own data:

```
# =====================================
# Firebase Configuration
# =====================================
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# =====================================
# Admin / Roles
# =====================================
VITE_ADMIN_EMAIL=admin@example.com
```
