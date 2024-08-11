# MotionBuilder Socket
NodeJS module for connecting to Autodesk MotionBuilder and running python commands.

## Example
```typescript
import { MotionBuilderSocket } from "motionbuilder-socket";

const socket = new MotionBuilderSocket();

socket.open().then(async () => {
    const response = await socket.exec("Cube=FBModelCube('Test');Cube.Show=True");
    socket.close();
});
```


_*This is a third-party module and is not associated with Autodesk or MotionBuilder in any way._