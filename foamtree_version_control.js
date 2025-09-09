const fs = require("fs");
const path = require("path");

const pkg = require("./package.json");
const overridePath = path.resolve(__dirname, "./src/assets/reacfoam/@carrotsearch/foamtree");

if (fs.existsSync(overridePath)) {
  console.log("✅ Using local foamtree override");
  pkg.dependencies["@carrotsearch/foamtree"] = `file:./src/assets/reacfoam/@carrotsearch/foamtree`;
} else {
  console.log("ℹ️ No override found, using registry foamtree");
  pkg.dependencies["@carrotsearch/foamtree"] = "^3.5.6";
}

fs.writeFileSync(
  path.resolve(__dirname, "./package.json"),
  JSON.stringify(pkg, null, 2)
);
