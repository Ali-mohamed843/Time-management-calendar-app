const fs = require('fs');
const path = require('path');

console.log('🔧 Configuring Firebase for Android...\n');

// Paths
const projectBuildGradle = path.join(__dirname, 'android', 'build.gradle');
const appBuildGradle = path.join(__dirname, 'android', 'app', 'build.gradle');

// Check if android folder exists
if (!fs.existsSync(path.join(__dirname, 'android'))) {
    console.error('❌ Android folder not found. Run: npx expo prebuild --platform android');
    process.exit(1);
}

// 1. Update project-level build.gradle
console.log('📝 Updating project-level build.gradle...');
let projectGradleContent = fs.readFileSync(projectBuildGradle, 'utf8');

// Check if google-services classpath already exists
if (!projectGradleContent.includes('com.google.gms:google-services')) {
    // Find the buildscript dependencies block
    const dependenciesRegex = /(buildscript\s*{[\s\S]*?dependencies\s*{[\s\S]*?)(}\s*})/;

    if (projectGradleContent.match(dependenciesRegex)) {
        projectGradleContent = projectGradleContent.replace(
            dependenciesRegex,
            (match, before, after) => {
                // Add the classpath before the closing braces
                return before + "        classpath 'com.google.gms:google-services:4.4.0'\n    " + after;
            }
        );

        fs.writeFileSync(projectBuildGradle, projectGradleContent);
        console.log('✅ Added Google Services classpath to project build.gradle');
    } else {
        console.log('⚠️  Could not find buildscript dependencies block. Please add manually:');
        console.log("   classpath 'com.google.gms:google-services:4.4.0'");
    }
} else {
    console.log('✅ Google Services classpath already exists');
}

// 2. Update app-level build.gradle
console.log('\n📝 Updating app-level build.gradle...');
let appGradleContent = fs.readFileSync(appBuildGradle, 'utf8');

// Check if google-services plugin already applied
if (!appGradleContent.includes("apply plugin: 'com.google.gms.google-services'") &&
    !appGradleContent.includes('apply plugin: "com.google.gms.google-services"')) {
    // Add at the end of the file
    appGradleContent += "\napply plugin: 'com.google.gms.google-services'\n";

    fs.writeFileSync(appBuildGradle, appGradleContent);
    console.log('✅ Added Google Services plugin to app build.gradle');
} else {
    console.log('✅ Google Services plugin already applied');
}

// 3. Check for google-services.json
const googleServicesJson = path.join(__dirname, 'android', 'app', 'google-services.json');
if (!fs.existsSync(googleServicesJson)) {
    console.log('\n⚠️  WARNING: google-services.json not found!');
    console.log('📥 Download it from Firebase Console and place it at:');
    console.log('   android/app/google-services.json');
    console.log('\n📖 Instructions:');
    console.log('   1. Go to https://console.firebase.google.com/');
    console.log('   2. Select your project');
    console.log('   3. Project Settings → Your apps → Add Android app');
    console.log('   4. Package name: com.alimoo23.instagram');
    console.log('   5. Download google-services.json');
} else {
    console.log('\n✅ google-services.json found!');
}

console.log('\n✨ Firebase configuration complete!');
console.log('\n📱 Next steps:');
console.log('   1. Make sure google-services.json is in android/app/');
console.log('   2. Run: npx expo run:android');
