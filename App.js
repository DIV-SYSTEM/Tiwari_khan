import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";

// Import OAuth libraries
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { LoginManager, AccessToken } from "react-native-fbsdk-next";

const { width, height } = Dimensions.get("window");

const App = () => {
  const [currentScreen, setCurrentScreen] = useState("signup");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Initialize OAuth services
  useEffect(() => {
    initializeOAuth();
  }, []);

  const initializeOAuth = async () => {
    try {
      // Configure Google Sign-In
      await GoogleSignin.configure({
        webClientId: "YOUR_WEB_CLIENT_ID", // Replace with your web client ID
        offlineAccess: true,
        hostedDomain: "",
        forceCodeForRefreshToken: true,
      });

      // Check if user is already signed in
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        setUserName(currentUser.user.name);
        setUserEmail(currentUser.user.email);
        setCurrentScreen("welcome");
      }
    } catch (error) {
      console.log("OAuth initialization error:", error);
    } finally {
      setInitializing(false);
    }
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Get user info
      const userInfo = await GoogleSignin.signIn();

      console.log("Google Sign-In Success:", userInfo);

      // Extract user data
      const { user } = userInfo;
      setUserName(user.name);
      setUserEmail(user.email);

      // Navigate to welcome screen
      setCurrentScreen("welcome");

      Alert.alert(
        "Success!",
        `Welcome ${user.name}! You've successfully signed in with Google.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      setLoading(false);
      console.log("Google Sign-In Error:", error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert("Cancelled", "Google sign-in was cancelled");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert("In Progress", "Google sign-in is in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Error", "Google Play Services not available");
      } else {
        Alert.alert("Error", "Something went wrong with Google sign-in");
      }
    } finally {
      setLoading(false);
    }
  };

  // Facebook Sign-In Handler
  const handleFacebookSignIn = async () => {
    try {
      setLoading(true);

      // Attempt login with permissions
      const result = await LoginManager.logInWithPermissions([
        "public_profile",
        "email",
      ]);

      if (result.isCancelled) {
        Alert.alert("Cancelled", "Facebook login was cancelled");
        setLoading(false);
        return;
      }

      // Get the access token
      const data = await AccessToken.getCurrentAccessToken();

      if (!data) {
        Alert.alert("Error", "Something went wrong obtaining access token");
        setLoading(false);
        return;
      }

      // Fetch user profile from Facebook Graph API
      const response = await fetch(
        `https://graph.facebook.com/me?access_token=${data.accessToken}&fields=id,name,email,picture.type(large)`
      );
      const userProfile = await response.json();

      console.log("Facebook Sign-In Success:", userProfile);

      // Extract user data
      setUserName(userProfile.name);
      setUserEmail(userProfile.email || "No email provided");

      // Navigate to welcome screen
      setCurrentScreen("welcome");

      Alert.alert(
        "Success!",
        `Welcome ${userProfile.name}! You've successfully signed in with Facebook.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      setLoading(false);
      console.log("Facebook Sign-In Error:", error);
      Alert.alert("Error", "Something went wrong with Facebook sign-in");
    } finally {
      setLoading(false);
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    try {
      setLoading(true);

      // Sign out from Google
      await GoogleSignin.signOut();

      // Sign out from Facebook
      LoginManager.logOut();

      // Reset state
      setUserName("");
      setUserEmail("");
      setCurrentScreen("signup");

      Alert.alert("Signed Out", "You have been signed out successfully");
    } catch (error) {
      console.log("Sign out error:", error);
      Alert.alert("Error", "Something went wrong during sign out");
    } finally {
      setLoading(false);
    }
  };

  // Loading Screen
  if (initializing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </SafeAreaView>
    );
  }

  const SignupScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />

      {/* Header with close button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton}>
          <View style={styles.closeIcon}>
            <Text style={styles.closeText}>×</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Logo Section */}
      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoSymbol}>🏃</Text>
          </View>
          <Text style={styles.logoText}>astro health</Text>
        </View>
        <Text style={styles.subtitle}>
          Create an account to save your Progress
        </Text>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        <Text style={styles.signupTitle}>Get Started</Text>
        <Text style={styles.signupSubtitle}>
          Choose your preferred sign-in method to continue
        </Text>
      </View>

      {/* Social Login Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={handleGoogleSignIn}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#4285F4" />
          ) : (
            <>
              <View style={styles.googleIcon}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={[styles.buttonText, styles.googleText]}>
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.facebookButton]}
          onPress={handleFacebookSignIn}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <View style={styles.facebookIcon}>
                <Text style={styles.facebookF}>f</Text>
              </View>
              <Text style={[styles.buttonText, styles.facebookText]}>
                Continue with Facebook
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <Text style={styles.termsText}>
          By continuing, you agree to our{"\n"}
          <Text style={styles.linkText}>Terms of Service</Text> and{" "}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>

        <View style={styles.loginSection}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );

  const WelcomeScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4ECDC4" />

      {/* Header with close button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton}>
          <View style={styles.closeIcon}>
            <Text style={styles.closeText}>×</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Logo Section */}
      <View style={styles.welcomeLogoSection}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoSymbol}>🏃</Text>
          </View>
          <Text style={styles.logoText}>astro health</Text>
        </View>
      </View>

      {/* Welcome Content */}
      <View style={styles.welcomeContent}>
        <Text style={styles.welcomeTitle}>Welcome {userName}!</Text>
        <Text style={styles.welcomeSubtitle}>
          You've successfully signed in. Let's personalize your health journey.
        </Text>

        <View style={styles.userInfo}>
          <Text style={styles.userInfoLabel}>Email:</Text>
          <Text style={styles.userInfoText}>{userEmail}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.welcomeActions}>
        <TouchableOpacity style={styles.continueButton} activeOpacity={0.8}>
          <Text style={styles.continueButtonText}>Continue to Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return currentScreen === "signup" ? <SignupScreen /> : <WelcomeScreen />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4ECDC4",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#4ECDC4",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    marginTop: 20,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  // Header Styles
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 5,
  },
  closeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "white",
    fontSize: 20,
    fontWeight: "300",
    lineHeight: 20,
  },

  // Logo Section
  logoSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  welcomeLogoSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logoSymbol: {
    fontSize: 20,
  },
  logoText: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  subtitle: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    opacity: 0.9,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    lineHeight: 22,
  },

  // Main Content
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  signupTitle: {
    color: "white",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  signupSubtitle: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 24,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  // Button Container
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 28,
    marginBottom: 16,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Google Button
  googleButton: {
    backgroundColor: "#FFFFFF",
  },
  googleIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  googleG: {
    color: "#4285F4",
    fontSize: 18,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  googleText: {
    color: "#1F2937",
  },

  // Facebook Button
  facebookButton: {
    backgroundColor: "#4267B2",
  },
  facebookIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  facebookF: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  facebookText: {
    color: "#FFFFFF",
  },

  // Button Text
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
    flex: 1,
    textAlign: "center",
    marginRight: 40,
  },

  // Bottom Section
  bottomSection: {
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  termsText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 20,
    lineHeight: 18,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  linkText: {
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  loginSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginText: {
    color: "white",
    fontSize: 14,
    opacity: 0.8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  loginButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  loginLink: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  // Welcome Screen Styles
  welcomeContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    color: "white",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  welcomeSubtitle: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: 30,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  userInfo: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    borderRadius: 16,
    width: "100%",
    marginTop: 20,
  },
  userInfoLabel: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.8,
    marginBottom: 5,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  userInfoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },

  // Welcome Actions
  welcomeActions: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  continueButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  signOutButton: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  signOutButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.8,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
});

export default App;
