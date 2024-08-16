import { BarsDockerContainer, BarsDocker, BarsDockerWindow, ContainerType } from "./bars-docker.js";
const root = document.getElementById("root");
if (root == null)
    throw new Error("Could not find root element in the document");
const docker = new BarsDocker(root);
const container1 = new BarsDockerContainer();
const window1 = new BarsDockerWindow("Window 1");
const window2 = new BarsDockerWindow("Window 2");
const window3 = new BarsDockerWindow("Window 3");
container1.setChildren(window2, window3, ContainerType.Vertical);
docker.setChildren(container1, window1, ContainerType.Horizontal);
