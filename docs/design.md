# Design Notes

Below are a set of assorted design notes that I wanted to keep. The goal is to understand why I did things the way I did and also understand what my thinking was for the future.

## Renderer

### "pixelsPerMeter"

I should start by saying that there is very important variable in the application called pixelsPerMeter that helps determine the size that everything is drawn at.

I've been trying to figure out the best way to render the objects that you see in the game. It turns out to be a bit a litte more involved than you would think.

I think the primary basis for the sizing should be a circle that represents a human being. This circle should be considered to be 1 meter in diameter.

From there, I should be able to simply set the current "zoom" level in pixels per meter.

The Viper based ship chassis that I am currently using is approximitly 9 meters in length.

#### Canvas Path Defintions

There are two issues with the path definitions worth discussing:

1. Coordinate System

Theoretically, the best way to define the paths themselves is probably to assume that the top left corner of the canvase is (0,0) and that the bottom right corner of the canvas is (1,1). All the points inbetween would then become relative, floating point numbers.

The reason for the coordinates going 0 to 1 is so that all paths are defined in a consistent way. Obviously, the rendered objects will normally be different sizes on the screen. This should be accomplished by scaling the objects as needed. But the original path should be unaware of this.

However, at this time I am breaking both rules.

I'm drawing all my paths in a way such that they are relative to each other. For example, a ship is ten points wide and everything else is relative to that. The thurster and laser graphics are relative to that ship size.

Also, because I wanted the objects to automaticly be centered, I always draw with the origin at the center of the object. For example, the ship ranges from -5 to 5 on both the X and Y axis.

2. Sizing considerations

Right now, I am sizing all the objects based on diving the viewble area of the screen by a constant (40 right now.) But that is not really the best way to go about it. What I should be doing is deciding what percentage of the screen I want the ship to fill. I mean, for the default. Users could zoom in and out from there.

So, what I tried to do is change the code such that the ship is defined from 0 to 1 and then scaled as neccisary to make it fill a certain percentage of the screen.

However, when I did that I started ti have problems. The main problem being that there are a bunch of things hard coded in the physics engine that make size assumptions. For example, missiles should start X number of "points" from the front of the ship. And that X is relative to the deault size of the ship, which I assumed to be ten "points."

#### Conclusion

So when I tried to fix all this other things started breaking and I decided to revert the code back for the time being because I had other things do do that seem to be more immediate needs, like having a proper landing page of the game.

#### Update

Today I went in and revamping the rendering engine. I changed all of the paths so that they are defined on a scale of -0.5 t0 0.5 in both the X and Y planes. I did this for two reasons: 1) it means that everything is consistenly defined at a scale of 1. 2) by going from -0.5 to 0.5 instead of 0 to 1, it makes the translation code much easier to calculate. When you start drawing from the top left corner of the object you have to do additional translations to make sure it lines up with its proper position. By having the image centered with (0,0) in the center, you can just draw it at the correct location.

Of course, making this improvment broke a bunch of things. I had to fix the algorithms that determine the starting position of lasers and thrusters, I had to tweak the collision detection code, I had to change the translation and scaling for everything to scale up the object from 1 to X.

There were a few other changes but I'm happy with the result. I feel like the rendering is a bit more predictible now and all measurements of distance are now based on the same base unit, 1 Meter. The raw path instructions all draw the objects to be 1 meter by 1 meter and then they are scaled up to the correct size.

The way I was doing it sucked because every object was scaled differently and had to be transformed differently. Not very scalable!

### Viewing Layers

I think the web application is going to have to have a couple of different layers. Until now, everything has basicly been in the same layer, the game play layer.

* Map

Everything in the current game is in the "map" layer and is relative to the player's ship, meaning they pan together, rotate together and zoom in and out together.

* Background

There is also one other kind of sudo layer that I call the background and has the stars in it. They are fixed to the viewport and do not change. But that is really not correct. I need to eventually change to some kind of tiling system that can support the ability to scroll infinelty in all direections. Because the player's ship needs to fly around in space and you have to be able to see the stars moving in the background. I know, that is not really realitic because in real life they are so far away that you really wouldn't see them moving. But, it looks a like cooler if they do move. Besides, if they don't move you often can not even tell if the ship is moving.

* HUD

I need to build another layer that is NOT a part of the "map" layer and is constantly fixed to the size of the current viewport. The HUD will contain things like the ships current status: energy, hull, speed, direction, mini map, etc...

## Sound Effects

* Main Thruster
* Rotational thrusters
* Laser Firing
* Laser striking
* Ship exploding
* Shield lowering (might be difficult)
* Shield raising (might be difficult)

### Proximity

Would be really nice to increase the decrese the volume of sound effects based on distance from player's ship.

### Volume Controls

Woud be really nice to provide volume and mute controls to the GUI

