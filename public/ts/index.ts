import { BarsDockerContainer, BarsDocker, BarsDockerWindow } from "./bars-docker.js";

const root: Element | null = document.getElementById("root")

if (root == null)
    throw new Error("Could not find root element in the document")

const docker: BarsDocker = new BarsDocker(root);


    
console.log("testing")