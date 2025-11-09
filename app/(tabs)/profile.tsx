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
  const [name, setName] = useState("");        // NEW
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

      if (mode === "signup" && !name.trim()) {
        setError("Please enter your name.");
        return;
      }

      setSubmitting(true);
      setError(null);

      if (mode === "signin") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(name.trim(), email, password);
      }

      const current = await getCurrentUser();
      setUser(current);
      setName("");
      setPassword("");
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
      setName("");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#050316",
        }}
      >
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  // ---------- LOGGED-IN VIEW ----------
  if (user) {
    const displayName = user.name || user.email;

    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#050316", padding: 20 }}
      >
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text
            style={{
              fontSize: 26,
              fontWeight: "700",
              color: "#f9fafb",
              marginBottom: 8,
            }}
          >
            Welcome, {displayName}
          </Text>

          <Text style={{ fontSize: 14, color: "#9ca3af", marginBottom: 4 }}>
            Signed in as:
          </Text>
          <Text style={{ fontSize: 16, color: "#e5e7eb", marginBottom: 24 }}>
            {user.email}
          </Text>

          {/* If you still want to show ID but less in-your-face */}
          <Text
            style={{
              fontSize: 12,
              color: "#6b7280",
              marginBottom: 24,
            }}
          >
            User ID: {user.$id}
          </Text>

          <TouchableOpacity
            onPress={handleSignOut}
            style={{
              backgroundColor: "#ef4444",
              paddingVertical: 12,
              borderRadius: 999,
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#050316", padding: 20 }}
    >
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

        {/* Name field (only in Sign Up mode) */}
        {mode === "signup" && (
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                color: "#e5e7eb",
                marginBottom: 6,
                fontSize: 14,
                fontWeight: "500",
              }}
            >
              Name
            </Text>
            <TextInput
              placeholder="What should we call you?"
              placeholderTextColor="#6b7280"
              value={name}
              onChangeText={setName}
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
        )}

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
