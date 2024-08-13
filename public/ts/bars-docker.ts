enum SizableElementPosition {
    Floating,
    Parented
}

class SizableElement
{
    parent: SizableElement | null;
    element: Element | null = null;

    float_x: number = 0;
    float_y: number = 0;

    size_x: number = 100;
    size_y: number = 100;

    constructor(parent: SizableElement | null)
    {
        this.parent = parent
    }

    onResize(): void
    {

    }
}

enum ContainerType {
    Horizontal,
    Vertical,
    Undefined
}

class BarsDockerContainer extends SizableElement
{
    container_type: ContainerType = ContainerType.Undefined;

    child1:  SizableElement | null = null;
    child2:  SizableElement | null = null;

    split_position: number = 0.5;

    constructor()
    {
        super(null);

        this.element = document.createElement("div")
        this.element.classList.add("BarsDockerContainer")
    }

    setChild1(child1: SizableElement | null)
    {
        this.child1 = child1
    }

    setChild2(child2: SizableElement | null)
    {
        this.child2 = child2
    }
}

class BarsDockerWindow extends SizableElement
{

    constructor()
    {
        super(null);

        this.element = document.createElement("div")
        this.element.classList.add("BarsDockerContainer")
    }
}

/*

*/

class BarsDocker extends BarsDockerContainer
{
    root: Element;

    constructor(root: Element)
    {
        super();
        this.root = root;
    }
}

export { BarsDocker, BarsDockerContainer, BarsDockerWindow }