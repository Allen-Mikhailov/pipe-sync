const floating_parent: Element = document.body

class SizableElement
{
    parent: BarsDockerContainer | null = null; // If no parent then is floating
    element: Element;

    float_x: number = 0;
    float_y: number = 0;

    size_x: number = 100;
    size_y: number = 100;

    constructor(element: Element, parent: BarsDockerContainer | null)
    {
        this.element = element;
        this.parentUpdate(parent);
    }

    onResize(): void
    {

    }

    parentUpdate(parent: BarsDockerContainer | null)
    {
        if (this.element == null) {return;} // Should never occur

        if (this.parent == null)
        {
            floating_parent.removeChild(this.element)
        }

        this.parent = parent
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
        const element = document.createElement("div")
        element.classList.add("BarsDockerContainer")

        super(element, null);
    }

    setChild1(child1: SizableElement | null)
    {
        this.child1 = child1
    }

    setChild2(child2: SizableElement | null)
    {
        this.child2 = child2
    }

    setChild3(child2: SizableElement | null)
    {
        this.child2 = child2
    }
}

class BarsDockerWindow extends SizableElement
{

    constructor()
    {
        const element = document.createElement("div")
        element.classList.add("BarsDockerWindow")

        super(element, null);
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