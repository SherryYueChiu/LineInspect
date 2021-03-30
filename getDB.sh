adb shell
run-as com.linecorp.linelite
chmod 777 databases
chmod 777 databases/LINE_LITE
chmod 777 databases/CHAT.db
cp /data/data/com.linecorp.linelite/databases/LINE_LITE /sdcard
cp /data/data/com.linecorp.linelite/databases/CHAT.db /sdcard
exit
exit
adb pull /sdcard/LINE_LITE
adb pull /sdcard/CHAT.db
mv LINE_LITE LINE_LITE.db