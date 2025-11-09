import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getCurrentUser,
  signInWithEmail,
  signUpWithEmail,
  signOut,
} from "@/services/appwrite";

const Profile = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState<any | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const current = await getCurrentUser();
      setUser(current);
      setLoadingUser(false);
    })();
  }, []);

  const handleAuth = async () => {
    try {
      if (!email || !password) {
        setError("Please enter email and password.");
        return;
      }

      setSubmitting(true);
      setError(null);

      if (mode === "signin") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }

      const current = await getCurrentUser();
      setUser(current);
    } catch (e: any) {
      setError(e?.message ?? "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setSubmitting(true);
      await signOut();
      setUser(null);
      setEmail("");
      setPassword("");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#050316" }}
      >
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  // ---------- LOGGED-IN VIEW ----------
  if (user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#050316", padding: 20 }}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: "#f9fafb",
              marginBottom: 12,
            }}
          >
            Profile
          </Text>

          <Text style={{ fontSize: 16, color: "#e5e7eb", marginBottom: 6 }}>
            User ID:{" "}
            <Text style={{ fontWeight: "600" }}>{user.$id}</Text>
          </Text>

          <Text style={{ fontSize: 16, color: "#e5e7eb", marginBottom: 24 }}>
            Email:{" "}
            <Text style={{ fontWeight: "600" }}>{user.email}</Text>
          </Text>

          <TouchableOpacity
            onPress={handleSignOut}
            style={{
              backgroundColor: "#ef4444",
              paddingVertical: 12,
              borderRadius: 8,
            }}
            disabled={submitting}
          >
            <Text
              style={{
                color: "#fff",
                textAlign: "center",
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              {submitting ? "Signing out..." : "Sign Out"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- AUTH FORM VIEW ----------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#050316", padding: 20 }}>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#f9fafb",
            marginBottom: 20,
          }}
        >
          {mode === "signin" ? "Sign In" : "Create Account"}
        </Text>

        {/* Email field */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              color: "#e5e7eb",
              marginBottom: 6,
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            Email
          </Text>
          <TextInput
            placeholder="you@example.com"
            placeholderTextColor="#6b7280"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={{
              borderWidth: 1,
              borderColor: "#4b5563",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: "#f9fafb",
              backgroundColor: "#020617",
            }}
          />
        </View>

        {/* Password field */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              color: "#e5e7eb",
              marginBottom: 6,
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            Password
          </Text>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#6b7280"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={{
              borderWidth: 1,
              borderColor: "#4b5563",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: "#f9fafb",
              backgroundColor: "#020617",
            }}
          />
        </View>

        {error && (
          <Text style={{ color: "#f97316", marginBottom: 10 }}>{error}</Text>
        )}

        <TouchableOpacity
          onPress={handleAuth}
          style={{
            backgroundColor: "#8b5cf6",
            paddingVertical: 12,
            borderRadius: 999,
            marginTop: 4,
          }}
          disabled={submitting}
        >
          <Text
            style={{
              color: "#fff",
              textAlign: "center",
              fontWeight: "600",
              fontSize: 16,
            }}
          >
            {submitting
              ? mode === "signin"
                ? "Signing in..."
                : "Creating account..."
              : mode === "signin"
              ? "Sign In"
              : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            setMode((prev) => (prev === "signin" ? "signup" : "signin"))
          }
          style={{ marginTop: 16 }}
        >
          <Text
            style={{
              textAlign: "center",
              color: "#9ca3af",
              fontSize: 14,
            }}
          >
            {mode === "signin"
              ? "Don't have an account? Create one"
              : "Already have an account? Sign in"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
