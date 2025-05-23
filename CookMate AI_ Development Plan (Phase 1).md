**1\. Project Overview**

* **Application Name:** CookMate AI  
* **Objective:** Create an AI-powered mobile cooking assistant, providing personalized guidance, recipe management, and meal suggestions based on user preferences and available groceries.  
* **Target Platform:** Android and iOS

**2\. Core Functionality (Phase 1 Focus)**

* **AI-Powered Cooking Assistant:**  
  * Implement conversational AI for real-time cooking guidance using a combination of **Google Gemini API** and **DeepSeek**, with **Rule-Based/Simpler AI** logic for basic interactions or fallbacks.  
  * Enable hands-free operation via voice commands using device's built-in voice recognition capabilities.  
  * Provide recipe narration and AI responses using device's built-in text-to-speech engine.  
  * Develop AI memory: Store user preferences, allergies, dietary needs, past interactions, and historical grocery lists to personalize suggestions. Provide an option for users to clear this memory.  
  * Implement ingredient substitution suggestions using the **Google Gemini API** and **DeepSeek** (enhanced by rule-based logic) when a user indicates a missing ingredient.  
* **Personalized Meal & Recipe Suggestions:**  
  * Create a user profile/settings screen to capture: Allergies, dietary preferences (vegan, gluten-free, etc.), favorite cuisines, disliked ingredients.  
  * **Grocery List Integration (See Section 3):** Allow users to input their available groceries via receipt scanning.  
  * Suggest recipes based on the user's profile preferences AND their **currently available/stored grocery items**.  
  * **Waste Reduction:** Actively suggest recipes that utilize ingredients from the user's stored grocery list to minimize food waste.  
* **Recipe Management & Discovery:**  
  * Enable users to manually add recipes via text input.  
  * Integrate with multiple free food APIs:  
    * **TheMealDB**  
    * **Spoonacular (via API layer)**  
    * **Nutritionix (check free tier limits)**  
    * **Edamam (free tier)**  
    * **WebKnox (check free tier limits)**

  Implement logic to handle potential API rate limits and data consolidation.

  * Implement robust search functionality with filters: difficulty, prep time, available ingredients (cross-referenced with user's stored grocery list), cuisine, dietary restrictions.  
  * Develop a community section (basic in Phase 1): Allow users to share recipes they've added and potentially rate recipes (from APIs or community).  
* **Step-by-Step Cooking Guide:**  
  * Display recipes in a clear, step-by-step format.  
  * Implement basic 2D animated walkthroughs or visual cues for key steps where feasible.  
  * Integrate cooking timers and alerts within the recipe steps.  
  * Allow users to adjust recipe serving sizes, automatically recalculating ingredient quantities.

**3\. Key Feature Deep Dive: Receipt Scanning & Grocery List Integration**

* **Objective:** Allow users to scan grocery receipts to automatically populate their available ingredients list, enabling highly personalized recipe suggestions and waste reduction features.  
* **Workflow:**  
  1. **Image Input:** User captures an image of their grocery receipt using the device camera.  
  2. **OCR (Optical Character Recognition):** Process the image using device's camera and OCR libraries to extract raw text.  
  3. **Data Extraction & Parsing:** Implement logic (likely a combination of **Regular Expressions (Regex)** and potentially **simple pattern-matching ML models** if needed) to parse the raw OCR text. This logic must identify individual grocery items, filtering out prices, store names, dates, totals, and other non-ingredient text.  
  4. **Item Identification & Normalization:** Standardize recognized item names (e.g., "Tomatoes, Roma" \-\> "Tomato").  
  5. **User Confirmation:** Display the extract ed list of items to the user for confirmation or correction before saving.  
  6. **Storage:** Save the confirmed list of grocery items to the **Supabase** database, associated with the user's profile and potentially the date of purchase/scan.  
  7. **Integration:** This stored grocery list becomes a primary input for:  
     * Recipe suggestion algorithms ("Show recipes using ingredients I have").  
     * Waste reduction tips.  
     * AI memory for long-term preference learning.

**4\. Technology Stack & Tools**

* **Frontend:** React Native with TypeScript, Expo, and Expo Router  
* **Backend/Database:** SQL Database
* **UI Framework:** React Native Paper ,   
* **AI Processing:** Google Gemini API and DeepSeek  
* **Image Processing:** Libraries for OCR (integrated into React Native)  
* **Animations:** React Native Animations

**5\. Data Management & Storage**

* **Supabase:**  
  * User Profiles (ID, preferences, allergies, dietary needs, etc.)  
  * Stored Grocery Items (Item name, quantity \[if extractable\], date added, linked to user ID)  
  * User-Added Recipes  
  * Community Recipes (if basic sharing implemented)  
  * Elements of AI Memory/History (e.g., frequently used ingredients, past searches \- consider privacy implications).

**6\. Offline Capabilities**

* Access to locally stored user profile, preferences, and saved grocery lists.  
* Access to cached recipes.  
* Voice command input.  
* Text-to-speech output.  
* Basic AI responses via rule-based system.  
* On-device OCR.  
* Recipe suggestions based *only* on locally stored data (recipes and grocery lists) when offline.

**7\. Future Enhancements (Phase 2 & Beyond \- Not in Scope for Phase 1\)**

* Smart Kitchen Device Integration  
* AI-Powered Plating & Presentation Tips  
* Nutritional Breakdown & Calorie Tracking (potentially using Nutritionix API data)  
* Advanced Meal Planning & Scheduling  
* Cloud Sync for User Data & Recipes  
* Visual Ingredient Recognition (using device camera for pantry inventory)  
* *And other unique features listed previously.*

**8\. Development Stages (Proposed)**

* **Phase 1:** Implement all features listed in Sections 2 & 3\. Focus on core functionality, receipt scanning pipeline, and integration of chosen tools.  
* **Phase 2+:** Gradually introduce features from Section 7 based on priority and resources.

**9\. Deliverables (Phase 1\)**

* A functional application implementing all Phase 1 features.  
* Well-structured and documented code.  
* Unit tests and integration tests where appropriate.  
* A user-friendly and intuitive interface.

**10\. Success Metrics**

* High user engagement (session time, feature usage).  
* Positive user reviews on the app store.  
* Accurate grocery item extraction from receipts (measure success rate).  
* Relevant and personalized recipe suggestions based on user profile and groceries.  
* Reliable performance of AI, STT, TTS, and offline features.  
* Minimal bugs and crashes.

**11\. Error Handling and User Feedback**

* Implement comprehensive error handling for all external interactions and potential failure points:  
  * **API Calls:** Use try-catch blocks to handle network errors (e.g., connectivity issues, server errors, invalid responses). Implement retry mechanisms with exponential backoff for transient errors. Define custom exceptions for specific API error scenarios.  
  * **OCR Processing:** Handle exceptions during image processing and text recognition. Check for null or empty results from the OCR engine.  
  * **Database Operations:** Use try-catch blocks to handle potential errors (e.g., database connection issues, data inconsistencies).  
  * **Speech Recognition/Synthesis:** Handle errors related to speech input (e.g., no speech detected, network errors) and text-to-speech initialization or synthesis failures.  
  * **Input Validation:** Validate user inputs (e.g., in user profile settings, manual recipe entry) and provide feedback for invalid data.  
* Provide clear and informative feedback to the user:  
  * Display user-friendly error messages in the UI (e.g., using dialogs, toasts, or inline text). Avoid technical jargon.  
  * For OCR errors, suggest alternative input methods (e.g., manual entry) and provide tips for improving receipt image quality.  
  * For API errors, indicate whether the issue is temporary and suggest retrying later.  
  * For database errors, attempt to recover if possible (e.g., by clearing corrupted data) or prompt the user to reinstall the app if necessary.  
  * Use logging to record errors and debug information for development and maintenance.

**12\. Privacy Considerations**

* Implement robust privacy measures to protect user data:  
  * **Data Minimization:** Collect only the data that is strictly necessary for the app's functionality.  
  * **Data Storage:** Store sensitive data (user profiles, grocery lists, recipes) securely in the Supabase database. Ensure that Supabase is configured to comply with relevant security best practices.  
  * **Data Encryption:** Consider encrypting sensitive data in transit and at rest.  
  * **User Consent:** Obtain explicit user consent before collecting or processing any personal data.  
  * **Data Deletion:** Provide users with clear and easy-to-use options to delete their data, including user profiles, grocery lists, and AI memory.  
  * **Transparency:** Clearly communicate the app's data usage and storage policies to users in a privacy policy. Explain what data is collected, how it is used, where it is stored, and how it is protected.  
  * **Gemini and DeepSeek API Usage:** Adhere to Google's and DeepSeek's privacy guidelines when using their APIs. Inform users that their interactions with the AI assistant may be processed, and provide links to the respective privacy policies. Consider offering users the option to opt out of data collection for AI model improvement, if available.  
  * **Anonymization:** If usage data is collected for analytics purposes, anonymize the data to protect user privacy.  
* **GDPR and Other Regulations:** Ensure compliance with relevant data privacy regulations, such as GDPR, CCPA, and others that may apply depending on the user's location.

**13\. API Integrations**

* Integrate with the following APIs to enhance the app's functionality:  
  * **TheMealDB (Free, No Auth)**  
    * Base URL: [https://www.themealdb.com/api/json/v1/1/](https://www.themealdb.com/api/json/v1/1/)

  interface TheMealDbService {  
          @GET("search.php")  
          suspend fun searchMeals(@Query("s") name: String): MealResponse

          @GET("lookup.php")  
          suspend fun getMealById(@Query("i") id: String): MealResponse  
      }

      val mealService \= ApiClient.create("https://www.themealdb.com/api/json/v1/1/", TheMealDbService::class.java)

  * **Open Food Facts (No Auth)**  
    * Base URL: [https://world.openfoodfacts.org/](https://world.openfoodfacts.org/)

  interface OpenFoodFactsService {  
          @GET("api/v0/product/{barcode}.json")  
          suspend fun getProductByBarcode(@Path("barcode") barcode: String): ProductResponse  
      }

      val foodFacts \= ApiClient.create("https://world.openfoodfacts.org/", OpenFoodFactsService::class.java)

  * **Optional: Edamam**  
    * Base URL: [https://api.edamam.com/](https://api.edamam.com/)

  interface EdamamService {  
          @GET("search")  
          suspend fun searchRecipes(  
              @Query("q") query: String,  
              @Query("app\_id") appId: String,  
              @Query("app\_key") appKey: String  
          ): EdamamRecipeResponse  
      }

  * **Optional: Chomp (UPC/Nutrition matching)**  
    * Base URL: [https://api.chompthis.com/](https://api.chompthis.com/)

interface ChompService {  
    @GET("v2/products")  
    suspend fun searchProduct(  
        @Query("name") name: String,  
        @Query("api\_key") apiKey: String  
    ): ChompResponse  
}

* Implement a strategy to handle API rate limits:  
  * **Caching:** Cache API responses in Supabase to reduce the number of API calls. Implement a caching policy (e.g., time-based expiration) to ensure data freshness.  
  * **Retry Mechanisms:** Implement retry mechanisms with exponential backoff for API requests that are rate-limited. Use the Retry-After header (if provided by the API) to determine the appropriate waiting time before retrying.  
  * **Rate Limit Monitoring:** Monitor API usage and track the number of requests made within a given time window.  
  * **Fallback Options:** If the API rate limit is exceeded, provide fallback options to the user, such as:  
    * Displaying cached data (if available).  
    * Suggesting recipes from a local database.  
    * Informing the user that the API is temporarily unavailable and suggesting they try again later.  
  * **User Notification:** Inform the user if the app is experiencing issues due to API rate limits. Provide a clear message explaining the situation and suggesting a course of action (e.g., "Recipe data is temporarily unavailable. Please try again later.").