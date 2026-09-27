cd "D:\Developer\Desktop\AQUA\streamvitals"
node node_modules/next/dist/bin/next build > "C:\Users\Developer\AppData\Local\Temp\next-build.log" 2>&1
echo "Build done"
node node_modules/next/dist/bin/next start > "C:\Users\Developer\AppData\Local\Temp\next-start.log" 2>&1
echo "Server started"
