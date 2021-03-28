# LineLite Inspect Project

## Database Structure

### REAL_CONTACT

```
0B 00 01 00 00 00 21
cid[33]
...
0AB 00 dd 00 00 dd dd
name[?]
0B 00 dd 00 00 00 ff
pic[78]
0B 00 ff 00 00 00 4E
intro[?]
0AB 00 ff 00 00 00 ff
2f
pic[78]
...
00 00 00

```

### REAL_GROUP

```

```

### chat_history

| Type | Format       |
| ---- | ------------ |
| 0    | Text / Photo |
| 6    | Call         |
| 7    | Sticker      |

| Status | Who   |
| ------ | ----- |
| 1      | Other |
| 2      | Me    |



## Link

### Sticker

https://stickershop.line-scdn.net/products/0/0/1/STKPKGID/PC/stickers/STKID.png

### Personal/Group Picture

https://profile.line-scdn.net/PIC