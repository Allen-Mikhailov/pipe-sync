"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bars_docker_1 = require("./bars-docker");
const root = document.getElementById("root");
if (root == null)
    throw new Error("Could not find root element in the document");
const docker = new bars_docker_1.BarsDocker(root);
