/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';

/**
 * The main class of this app. All the logic goes here.
 */
export default class HelloWorld {
	private text: MRE.Actor = null;
	private cube: MRE.Actor = null;
	private assets: MRE.AssetContainer;

	constructor(private context: MRE.Context) {
		this.context.onStarted(() => this.started());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private async started() {
		// set up somewhere to store loaded assets (meshes, textures, animations, gltfs, etc.)
		this.assets = new MRE.AssetContainer(this.context);

		// spawn a copy of the glTF model
		this.cube = MRE.Actor.CreateFromLibrary(this.context, {
			// Also apply the following generic actor properties.
			actor: {
				name: 'Altspace Cube',
				// Parent the glTF model to the text actor, so the transform is relative to the text
				transform: {
					local: {
						position: { x: 0, y: -1, z: 0 },
						scale: { x: 0.3, y: 0.3, z: 0.3 }
					}
				}
			},
			resourceId: 'artifact:1931375002129531487'
		});

		// Create some animations on the cube.
		const flipAnimData = this.assets.createAnimationData(
			// the animation name
			"DoAFlip",
			{ tracks: [{
				// applies to the rotation of an unknown actor we'll refer to as "target"
				target: MRE.ActorPath("target").transform.local.rotation,
				// do a spin around the X axis over the course of one second
				keyframes: this.generateSpinKeyframes(1.0, new MRE.Vector3(0.0,1.0,0.0)),
				// and do it smoothly
				easing: MRE.AnimationEaseCurves.Linear
			}]}
		);
		// apply the animation to our cube
		const flipAnim = await flipAnimData.bind({ target: this.cube });

		// Set up cursor interaction. We add the input behavior ButtonBehavior to the cube.
		// Button behaviors have two pairs of events: hover start/stop, and click start/stop.
		const buttonBehavior = this.cube.setBehavior(MRE.ButtonBehavior);

		// Trigger the grow/shrink animations on hover.
		buttonBehavior.onHover('enter', () => {
			// use the convenience function "AnimateTo" instead of creating the animation data in advance
			MRE.Animation.AnimateTo(this.context, this.cube, {
				destination: { transform: { local: { scale: { x: 0.4, y: 0.4, z: 0.4 } } } },
				duration: 0.3,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			});
		});
		buttonBehavior.onHover('exit', () => {
			MRE.Animation.AnimateTo(this.context, this.cube, {
				destination: { transform: { local: { scale: { x: 0.3, y: 0.3, z: 0.3 } } } },
				duration: 0.3,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			});
		});

		// When clicked, do a 360 sideways.
		buttonBehavior.onClick(_ => {
			flipAnim.play();
		});
	}

	/**
	 * Generate keyframe data for a simple spin animation.
	 * @param duration The length of time in seconds it takes to complete a full revolution.
	 * @param axis The axis of rotation in local space.
	 */
	private generateSpinKeyframes(duration: number, axis: MRE.Vector3): Array<MRE.Keyframe<MRE.Quaternion>> {
		return [{
			time: 0 * duration,
			value: MRE.Quaternion.RotationAxis(axis, 0)
		}, {
			time: 0.25 * duration,
			value: MRE.Quaternion.RotationAxis(axis, Math.PI / 2)
		}, {
			time: 0.5 * duration,
			value: MRE.Quaternion.RotationAxis(axis, Math.PI)
		}, {
			time: 0.75 * duration,
			value: MRE.Quaternion.RotationAxis(axis, 3 * Math.PI / 2)
		}, {
			time: 1 * duration,
			value: MRE.Quaternion.RotationAxis(axis, 2 * Math.PI)
		}];
	}
}
