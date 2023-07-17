# MotionBuilder Socket
NodeJS module for connecting to Autodesk MotionBuilder

## Example
```typescript
import { MotionBuilderSocket } from "motionbuilder-socket";

const socket = new MotionBuilderSocket();
socket.open().then(() => {
    const response = socket.exec("from pyfbsdk import *;FBModelCube('Test')");
});
```

_*This is a third-party module and is not associated with Autodesk or MotionBuilder in any way._