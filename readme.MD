![Crafter](https://raw.githubusercontent.com/jordan4ibanez/crafter/refs/heads/main/menu/header.png)
A classic Luanti game, brought back to life. 


todo: This thing needs the blocks put in it's own mod because this is a disaster.

todo: redo vec2 and vec3 as a TS class instead of the current mess.

---


### How to compile Crafter:

If you want to mess with this or maybe you would want to use TS for your luanti things.
 
First you need node/nodejs/npm, if you're on ubuntu it's super outdated so go to the nodejs website and install it.

**This is developed with the latest version of nodejs/npm**

Next you need TypeScriptToLua, typescript, and nodejs types.
Also, you need Lua types for TS or else the compiler doesn't know what's going on.
Also also, jszip is for creating a release zip.
```
npm install -D typescript-to-lua typescript @types/node lua-types jszip
```

Now start up minetest, and select Crafter, then make a world named ``debugging``. The game will probably immediately crash.

Next you run ``make``.

I HIGHLY recommend you use ``make``. It automates a BUNCH of things. ``make clean`` is for a complete rebuild along with installing new media (images, music, models, etdc).

No make automation scripts created for windows yet though. It's because I don't run windows. If this works in windows, hooray!


---


If you want to join my discord:
https://discord.gg/D95q7BHUE4