import * as FS from "node:fs";
import * as Exec from "node:child_process";
import Zip from "jszip";

//? Check if the project should be fully rebuilt.
const [REBUILD_CODE, COPY_MEDIA, CREATE_RELEASE] = (() => {
	let rebuild: boolean = false;
	let copyMedia: boolean = false;
	let createRelease: boolean = false;

	// Certain scenarios need to be captured.
	const args = process.argv.slice(2);
	if (!args) return [false, false, false];
	if (args.length == 0) return [false, false, false];

	// Now let's see if we have some arguments.
	args.forEach((arg: string) => {
		if (arg === "--rebuild-code") {
			rebuild = true;
		} else if (arg === "--copy-media") {
			copyMedia = true;
		} else if (arg === "--create-release") {
			rebuild = true;
			copyMedia = true;
			createRelease = true;
		}
	});

	return [rebuild, copyMedia, createRelease];
})();

//? Remove the mods directory and recompile the entire program.
//~ Only if specified.
if (REBUILD_CODE) {
	FS.rmSync("mods/", { recursive: true, force: true });
	Exec.execSync("npx tstl");
}

//? Copy media assets into the build.
//~ Only if specified.
if (COPY_MEDIA) {
	["models", "sounds", "schematics", "textures"].forEach((id: string) => {
		FS.cpSync(`source/${id}/${id}`, `mods/${id}/${id}`, {
			recursive: true,
		});
	});
}

//? Copy the config files.
//! Always runs.
FS.readdirSync("source/", { recursive: false }).forEach(
	(item: string | Buffer) => {
		// Basic checks to make sure nothing explodes.
		if (item instanceof Buffer) return;
		if (!FS.statSync(`source/${item}`).isDirectory()) return;
		if (!FS.existsSync(`source/${item}/mod.conf`))
			throw new Error(`mod ${item} is missing a mod.conf!`);
		// So now, if the folder doesn't exist it needs to be made.
		if (!FS.existsSync(`mods/${item}`)) {
			FS.mkdirSync(`mods/${item}`);
		} else {
			// If a file is accidentally put in the mods folder during testing, this needs manual intervention.
			if (!FS.statSync(`source/${item}`).isDirectory())
				throw new Error(`mod ${item} is a file in the mods folder!`);
		}
		FS.copyFileSync(`source/${item}/mod.conf`, `mods/${item}/mod.conf`);
	}
);

//? Create a release zip file for this to be deployed on github.
//~ This is the most time consuming option.
if (CREATE_RELEASE) {
	function getVersionInfo(): string {
		let versionInfo: string | null = null;

		for (const line of FS.readFileSync(
			"./source/crafter/init.ts",
			"utf-8"
		).split("\n")) {
			if (line.trim().startsWith("export const version: string = ")) {
				console.log("HIT");
				const foundData: string[] = line.split(" ");

				versionInfo = foundData[foundData.length - 1].slice(0, -1);
				break;
			}
		}
		if (versionInfo === null) {
			throw new Error("Could not find version info!");
		}
		return versionInfo;
	}

	const releaseFolder: string = "crafter/";
	// Set up the release build folder.
	console.log("Creating release.");
	if (FS.existsSync("crafter_release.zip")) {
		console.log("Deleting old zip.");
		FS.rmSync("crafter_release.zip");
	}
	if (FS.existsSync(releaseFolder)) {
		console.log("Removing old release folder.");
		FS.rmSync(releaseFolder, { recursive: true, force: true });
	}

	FS.mkdirSync(releaseFolder);

	// Now copy...

	// mods/ folder.
	FS.cpSync(`mods/`, `${releaseFolder}mods/`, { recursive: true });
	// menu/ folder.
	FS.cpSync(`menu/`, `${releaseFolder}menu/`, { recursive: true });
	// readme.MD
	FS.cpSync(`readme.MD`, `${releaseFolder}readme.MD`);
	// LICENSE
	FS.cpSync(`LICENSE`, `${releaseFolder}LICENSE`);
	// game.conf
	FS.cpSync(`game.conf`, `${releaseFolder}game.conf`);

	// Then make a zip.
	const zip: Zip = new Zip();

	FS.readdirSync(releaseFolder, { recursive: true }).forEach(
		(item: string | Buffer) => {
			// Basic checks to make sure nothing explodes.
			if (!item) return;
			if (item instanceof Buffer) return;
			if (typeof item === "object") return;
			// And raw copying.
			const current: string = `${releaseFolder}${item}`;
			if (!FS.statSync(current).isDirectory()) {
				zip.file(current, FS.readFileSync(current));
			}
		}
	);

	zip.generateAsync({ type: "blob" }).then((content: Blob) => {
		content.arrayBuffer().then((data: ArrayBuffer) => {
			FS.writeFileSync("crafter_release.zip", new DataView(data));
		});
	});

	// todo: create a tar.gz creator, or not. tar czf crafter_release.tar.gz crafter_release/

	// And finally, remove the build folder.
	if (FS.existsSync(releaseFolder)) {
		FS.rmSync(releaseFolder, { recursive: true, force: true });
		console.log("Completed.");
	}
}
