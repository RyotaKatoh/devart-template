# Nazca

## Authors
[Tomohiro Nagata](https://github.com/tomo461 “TomohiroNagata”) / Researcher, Engineer, Programmer
[Ryota Katoh](https://github.com/RyotaKatoh/ "RyotaKatoh") / Engineer, Programmer



## Description
The Nazca Lines is one of the seven wonders of the world.
The purpose and the drawing method are still discussed.
Did they send the signs to aliens? I don’t know.
Our project “Nazca” draw the geoglyph of your face.
How about sending your face image to aliens?

## Example Code
```
mask.clear();
int numUsers = kinect[0].getNumTrackedUsers();
cout << numUsers << endl;
for (int nID = 0; nID < numUsers; nID++){
	ofxOpenNIUser & user = kinect[0].getTrackedUser(nID);
	if (user.isSkeleton()) {
		if (!userMasks[nID].isAllocated()) {
			userMasks[nID].allocate(user.getMaskPixels().getWidth(), user.getMaskPixels().getHeight(), OF_IMAGE_GRAYSCALE);
		}
		userMasks[nID].setFromPixels(user.getMaskPixels().getChannel(3));
		invert(userMasks[nID]);
			
		if (!tmp.isAllocated()) {
			tmp.allocate(user.getMaskPixels().getWidth(), user.getMaskPixels().getHeight(), OF_IMAGE_GRAYSCALE);
		}
		if (!mask.isAllocated()) {
			mask.allocate(userMasks[nID].getWidth(), userMasks[nID].getHeight(), OF_IMAGE_GRAYSCALE);
			mask.setFromPixels(userMasks[nID]);
			continue;
		}
		bitwise_or(mask, userMasks[nID], tmp);
		mask.setFromPixels(tmp);
	}
}
```
## Links to External Libraries

[Awesomium](http://www.awesomium.com/ “Awesomium”)
[ofxOpenNI](https://github.com/gameoverhack/ofxOpenNI)

## Images & Videos

![Nazca Image](project_images/cover.jpg?raw=true “Nazca Image")

https://www.youtube.com/watch?v=l7BsilP7SvM