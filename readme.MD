# Crafter
 A minetest game written in TypeScript because I felt like it.

(Don't tell anyone that this is crafter)

todo: This thing needs the blocks put in it's own mod because this is a disaster.
todo: redo vec2 and vec3 as a TS class instead of the current mess.

---

### How to make this show up in the online content browser

Go here: https://content.minetest.net/help/non_free/

Follow the instructions in ``How can I show non-free packages in the client?``

If you don't like this, don't complain to me.

### Using TS with this thing

If you want to mess with this or maybe you would want to use TS for your minetest things.
 
First you need node, if you're on ubuntu it's super outdated so go to the nodejs website and install it.

**This is developed with the latest version of nodejs/npm**

Next you need TypeScriptToLua, typescript, and nodejs types.
Also, you need Lua types for TS or else the compiler doesn't know what's going on.
Also also, jszip is for creating a release zip.
```
npm install -D typescript-to-lua typescript @types/node lua-types jszip
```

I HIGHLY recommend you use ``make``. It automates a BUNCH of things. There's even ``make clean`` to see if everything is working.

No make automation scripts created for windows yet though. It's cause I don't run windows.

---

### Texture pack:

https://content.minetest.net/packages/MysticTempest/refi_textures/

Name: REFI Textures 

Creator: MysticTempest

License: CC-BY-SA-4.0

---

### Sounds

Sound credits are documented in the sounds mod folder.

---

Join my discord to see me ramble like a maniac:
https://discord.gg/7DhNQFP3fv