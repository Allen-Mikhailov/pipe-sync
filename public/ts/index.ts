import { BarsDockerContainer, BarsDocker, BarsDockerWindow, ContainerType, ChildType } from "./bars-docker.js";

const root: HTMLElement | null = document.getElementById("root")

if (root == null)
    throw new Error("Could not find root element in the document")

const docker: BarsDocker = new BarsDocker(root);

const container1 = new BarsDockerContainer();
const window1 = new BarsDockerWindow("Window 1");
const window2 = new BarsDockerWindow("Window 2");
const window3 = new BarsDockerWindow("Window 3");

container1.setChildren(window2, window3, ContainerType.Vertical)
docker.setChildren(container1, window1, ContainerType.Horizontal)

const window4 = new BarsDockerWindow("Window 4 (Floating)");
window4.setParent(null, ChildType.None)