import { BarsDocker } from "./bars-docker.js";
const root = document.getElementById("root");
if (root == null)
    throw new Error("Could not find root element in the document");
const docker = new BarsDocker(root);
docker.setChild1();
console.log("testing");
