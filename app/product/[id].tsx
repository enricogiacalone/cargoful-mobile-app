import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import Endpoints from "@/constants/Endpoints";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ProductDetail {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  images: string[];
  category: string;
  rating: number;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const {
    data: product,
    isLoading,
    isError,
    refetch,
  } = useQuery<ProductDetail>({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await fetch(`${Endpoints.dummyjson_products}/${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch product details");
      }
      return res.json();
    },
    enabled: !!id,
  });

  const buyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(Endpoints.webhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: id,
          title: product?.title,
          price: product?.price,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok && response.status !== 200) {
        throw new Error("Server returned error status");
      }
    },
    onSuccess: () => {
      Alert.alert(
        "Success",
        `Thank you! Your purchase of "${product?.title}" was completed successfully.`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    },
    onError: (err: any) => {
      Alert.alert(
        "Failure",
        `Purchase request sent!\n\nDetails:\nProduct ID: ${id}\nTitle: ${product?.title}\n\n(Note: Network status details: ${err.message || "No internet or custom server endpoint"})`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    },
  });

  if (isLoading) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: colors.error }]}>
          Error loading product details.
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.tint }]}
          onPress={() => refetch()}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar style={colorScheme === "light" ? "dark" : "light"} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        <Image
          source={{ uri: product.images?.[0] || product.thumbnail }}
          style={[styles.image, { backgroundColor: colors.border }]}
          resizeMode="cover"
        />

        <View style={styles.infoContainer}>
          {/* Category Tag */}
          <View
            style={[styles.categoryTag, { backgroundColor: colors.border }]}
          >
            <Text style={[styles.categoryText, { color: colors.tint }]}>
              {product.category.toUpperCase()}
            </Text>
          </View>

          {/* Title & Price */}
          <Text style={[styles.title, { color: colors.text }]}>
            {product.title}
          </Text>
          <Text style={[styles.price, { color: colors.tint }]}>
            ${product.price.toFixed(2)}
          </Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              * {product.rating.toFixed(1)} / 5.0
            </Text>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Description */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Description
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {product.description}
          </Text>
        </View>
      </ScrollView>

      {/* Buy Button */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.cardBackground,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.buyButton,
            { backgroundColor: colors.tint },
            buyMutation.isPending && {
              backgroundColor: colors.tintDisabled,
              shadowOpacity: 0,
              elevation: 0,
            },
          ]}
          onPress={() => buyMutation.mutate()}
          disabled={buyMutation.isPending}
          activeOpacity={0.8}
        >
          {buyMutation.isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.buyButtonText}>Buy Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for the fixed bottom footer
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  image: {
    width: "100%",
    height: 300,
  },
  infoContainer: {
    padding: 20,
  },
  categoryTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    lineHeight: 30,
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    width: "100%",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  buyButton: {
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
