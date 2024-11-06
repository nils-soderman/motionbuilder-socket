# MotionBuilder Socket
NodeJS module for connecting to Autodesk MotionBuilder and running python commands.

This requires MotionBuilder's python server to be running, which is enabled by default and can be changed in: Settings -> Preferences -> Python -> Enabled Server

## Example
```typescript
import { MotionBuilderSocket } from "motionbuilder-socket";

const socket = new MotionBuilderSocket();

socket.open().then(async () => {
    const response = await socket.exec("Cube=FBModelCube('Test');Cube.Show=True");
    socket.close();
});
```

## Changelog
For a list of changes, see [releases](https://github.com/nils-soderman/motionbuilder-socket/releases)

<br>

_*This is a third-party module and is not associated with Autodesk or MotionBuilder in any way._