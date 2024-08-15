import { BarsDockerContainer, BarsDocker, BarsDockerWindow, ContainerType } from "./bars-docker.js";

const root: HTMLElement | null = document.getElementById("root")

if (root == null)
    throw new Error("Could not find root element in the document")

const docker: BarsDocker = new BarsDocker(root);

const container1 = new BarsDockerContainer();
const window1 = new BarsDockerWindow();
const window2 = new BarsDockerWindow();
const window3 = new BarsDockerWindow();

container1.setChildren(window2, window3, ContainerType.Vertical)
docker.setChildren(container1, window1, ContainerType.Horizontal)