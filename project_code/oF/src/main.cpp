#include "testApp.h"

int main() {
	ofSetupOpenGL(CAM_FRAME_SIZE_WIDTH + MAP_FRAME_SIZE_WIDTH, MAP_FRAME_SIZE_HEIGHT, OF_WINDOW);
	ofRunApp(new testApp());
}
