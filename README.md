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
3. Recipe Card
   - Highlights total cooking time, servings, macros and if link provided quick view option
4. Add Recipes
   - Give Personal Rating / Feedback if Made
5. View Recipe
   - View Direct Link of Source
   - Add To Meal Plan
   - Add To Favorites
   - Add Ingredients To Shopping Cart
6. Favorites
   - Delete From Favorites
7. Meal Planner
   - Drag Recipes To Respective Day / Slot (Breakfast, Snacks, Lunch, Dinner, Dessert)
   - Sums up P/C/F for day
   - Quick View of Recipe
   - Delete From Meal Plan Day / All Together

## Future Development Goals

1. Admin
   - Quickly Pullback Pending Submissoins (Verify No Junk Added)
     - Approve / Reject Submissions
2. Pages
   - Settings
     - Link Family Member (Shared Meal Plan/Favorites)
     - Change Name / Other Settings
     - Make a Suggestion
     - Whats New including version numbers
3. Add Recipe
   - If link provided, try to scrape directions and ingredients
   - Add custom image for card
4. Filter
   - Show Total Recipe Count At Top
   - Add Date Filter
   - Add Most Popular Option
   - First / Last Page Quick Clicks
   - If Date = Today or Pending Status show NEW tag
   - Fix Order By - not reflecting correctly
   - Pagination Should move back to top of page
5. Recipe Card
   - If quick added, for Macros and Servings, have it show "Quick added, details needed"
6. Back Button
   - Does Not Go Back To Filtered Items
7. Meal Plan
   - When I remove a fuel from the list, do not remove from the days its been assigned
   - Add Filter to Meal Plan Fuel List if multiple

# Contributing

## Local Dev

1. Pull project down to local folder
2. Install local modules needed to run by running the command within the terminal: **npm install**
3. Create inside the main folder a file named **.env.local**
4. Add these values to your **.env.local** file and populate with your own data:

```
# =====================================
# Firebase Configuration
# =====================================
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# =====================================
# Email Service Templates
# =====================================
VITE_EMAILJS_SERVICE=
VITE_EMAILJS_TEMPLATE=
VITE_EMAILJS_PUBLIC=

# =====================================
# Admin / Roles
# =====================================
VITE_ADMIN_EMAIL=
```

5. Then within terminal inside your project folder type **npm run dev**
