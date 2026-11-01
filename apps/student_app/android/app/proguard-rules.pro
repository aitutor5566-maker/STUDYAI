# Flutter Proguard Rules for STUDYAI
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.**  { *; }

# Preserve Three.js and WebView Javascript interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Don't obfuscate model classes and serialized objects
-keepattributes Signature
-keepattributes *Annotation*
-dontwarn java.lang.invoke.**
