var orientation = {
  left: "left",
  right: "right",
};

var state = {
  orientation: "left",
};

var constants = {
  ui: {
    width: 150,
  },
  inputFields: {
    name: null,
    occupation: null,
    duration: null,
    frameRate: null,
  },
};

// Update methods
function renderState() {
  var name = constants.inputFields.name.text;
  var occupation = constants.inputFields.occupation.text;
  var orientation = state.orientation;
  compositionConstants.project.duration = constants.inputFields.duration.text;
  compositionConstants.project.frameRate = constants.inputFields.frameRate.text;
  createLowerThird({
    name: name,
    occupation: occupation,
    orientation: orientation,
  });
}

// Click handlers
function handleApply() {
  renderState();
  panel.close();
}

function handleDidSelectOrientation(orientation) {
  switch (orientation) {
    case this.orientation.left:
      state.orientation = orientation;
      break;
    case this.orientation.right:
      state.orientation = orientation;
      break;
    default:
      alert(orientation + " was not implemented");
      break;
  }
}

/**
 * Panel UI documentation: https://adobeindd.com/view/publications/a0207571-ff5b-4bbf-a540-07079bd21d75/92ra/publication-web-resources/pdf/scriptui-2-16-j.pdf
 */

//
// Generic
// Layout Builder Helpers
//
function addLabel(container, text) {
  var statictext = container.add("statictext", undefined, text, {
    multiline: true,
  });
  return statictext;
}

function addInputField(container, text) {
  var edittext = container.add("edittext", undefined, text);
  edittext.minimumSize.width = constants.ui.width;
  return edittext;
}

function addButton(container, text, onClick) {
  var button = container.add("button", undefined, text);
  button.onClick = onClick;
  return button;
}

function addRadioSelector(container, items, onSelect) {
  var group = container.add("panel");
  group.alignChildren = "left";
  var radiobuttons = [];
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var radiobutton = group.add("radiobutton", undefined, item);
    radiobuttons.push(radiobutton);
    radiobutton.value = i == 0;
    radiobutton.onClick = function () {
      for (var y = 0; y < radiobuttons.length; y++) {
        if (radiobuttons[y].value == true) {
          onSelect(radiobuttons[y].text);
        }
      }
    };
  }
  onSelect(items[0]);
  return group;
}

// Setup
// The following code will be run by Adobe After effects
var panel =
  this instanceof Panel
    ? this
    : new Window("palette", "Lower Thirds", undefined, {
        resizeable: true,
        closeButton: true,
      });

var inputGroup = panel.add("group");
inputGroup.orientation = "column";
inputGroup.alignChildren = ["right", "top"];

var durationGroup = inputGroup.add("group");
var durationLabel = addLabel(durationGroup, "Duration");
durationLabel.minimumSize.width = constants.ui.width;
constants.inputFields.duration = addInputField(durationGroup, "4");

var frameRateGroup = inputGroup.add("group");
var frameRateLabel = addLabel(frameRateGroup, "Framerate");
frameRateLabel.minimumSize.width = constants.ui.width;
constants.inputFields.frameRate = addInputField(frameRateGroup, "24.95");

var nameGroup = inputGroup.add("group");
var nameLabel = addLabel(nameGroup, "Name");
nameLabel.minimumSize.width = constants.ui.width;
constants.inputFields.name = addInputField(nameGroup, "Bans Kakens");

var occupationGroup = inputGroup.add("group");
var occupationLabel = addLabel(occupationGroup, "Occupation");
occupationLabel.minimumSize.width = constants.ui.width;
constants.inputFields.occupation = addInputField(
  occupationGroup,
  "Pijpenlikker"
);

var orientationGroup = inputGroup.add("group");
var orientationLabel = addLabel(orientationGroup, "Orientation");
orientationLabel.minimumSize.width = constants.ui.width;
var orientationRadio = addRadioSelector(
  orientationGroup,
  ["left", "right"],
  handleDidSelectOrientation
);
orientationRadio.minimumSize.width = constants.ui.width;

var applyButton = panel.add("button", undefined, "apply");
applyButton.onClick = function () {
  handleApply();
};

if (panel instanceof Window) {
  panel.center();
  panel.show();
} else {
  panel.layout.layout(true);
}

//
// Project Variables
//
var compositionConstants = {
  debug: {
    verbose: false,
  },
  project: {
    width: 1920 * 2,
    height: 1080 * 2,
    pixelAspect: 1,
    duration: 4,
    frameRate: 60,
  },
  composition: {
    titleLayer: null,
    descriptionLayer: null,
    rectangleLayer: null,
  },
};

//
// Lower Third Specific Functions
//

// Call this to run everything in the correct order
function createLowerThird(configuration) {
  var undoGroup = "lower-third";
  app.beginUndoGroup(undoGroup);
  createLayers(configuration.name, configuration.occupation);
  app.endUndoGroup();
}

/**
 * Creates the lower-third layer setup
 * @param {string} name The interviewee's name
 * @param {string} occupation The interviewee's occupation
 */
function createLayers(name, occupation) {
  var composition = createOrReplaceComposition("Lower Third - " + name);

  var width = compositionConstants.project.width;
  var height = compositionConstants.project.height;
  var padding = { vertical: 200, horizontal: 200 };
  var shapeSize = { width: 80, height: 324 };

  var descriptionLayer = createTextLayer(
    composition,
    occupation,
    "Caviar Dreams",
    100
  );
  descriptionLayer.name = "occupation";
  descriptionLayer.position.setValue([
    isRight()
      ? width -
        (padding.horizontal +
          shapeSize.width +
          getFrame(descriptionLayer).width)
      : padding.horizontal + shapeSize.width,
    height - padding.vertical,
  ]);
  compositionConstants.composition.descriptionLayer = descriptionLayer;
  var descriptionFrame = getFrame(descriptionLayer);

  var titleDescriptionSpacing = 20;
  var titleLayer = createTextLayer(composition, name, "Bebas Neue", 200);
  titleLayer.name = "title";
  titleLayer.position.setValue([
    isRight()
      ? width -
        (padding.horizontal + shapeSize.width + getFrame(titleLayer).width)
      : padding.horizontal + shapeSize.width,
    height -
      (padding.vertical + descriptionFrame.height + titleDescriptionSpacing),
  ]);
  compositionConstants.composition.titleLayer = titleLayer;
  var titleFrame = getFrame(titleLayer);

  var rectangleLayer = createRectangleLayer(composition, {
    width: 70,
    height: (descriptionFrame.bottom - titleFrame.top) * 1.2,
  });

  compositionConstants.composition.rectangleLayer = rectangleLayer;

  // Setup animations
  setupShapeAnimation(rectangleLayer);
  setupTextAnimation(titleLayer, 0.0);
  setupTextAnimation(descriptionLayer, 0.1);
  setupMaskAndAnimation(titleLayer);
  setupMaskAndAnimation(descriptionLayer);
}

function setupShapeAnimation(layer) {
  // Rectangle Animation
  var transform = layer.property("Transform");
  var titleFrame = getFrame(compositionConstants.composition.titleLayer);
  var descriptionFrame = getFrame(
    compositionConstants.composition.descriptionLayer
  );

  var textToShapeSpacing = 80;
  var endPositon = [
    isRight()
      ? titleFrame.right + textToShapeSpacing
      : titleFrame.left - textToShapeSpacing,
    (titleFrame.top + descriptionFrame.bottom) / 2,
  ];
  endPositon[0] += titleFrame.width; // magic goddamn fix
  var startPositon = [
    isRight()
      ? titleFrame.left - textToShapeSpacing
      : titleFrame.right + textToShapeSpacing,
    (titleFrame.top + descriptionFrame.bottom) / 2,
  ];
  startPositon[0] += titleFrame.width; // magic goddamn fix

  var entryStart = 0;
  var entryDuration = 1;
  transform.position.setValueAtTime(entryStart, startPositon);
  transform.position.setValueAtTime(entryStart + entryDuration, endPositon);
  setEase(transform.position, 1, 1);
  setEase(transform.position, 2, 0.7);

  var scaleEntryStart = 0;
  var scaleEntryDuration = 0.2;
  transform.scale.setValueAtTime(scaleEntryStart, [100, 0]);
  setEase3D(transform.scale, 1, 0.7);
  transform.scale.setValueAtTime(scaleEntryStart + scaleEntryDuration, [
    100,
    100,
  ]);
  setEase3D(transform.scale, 2, 0.5);
  transform.scale.setValueAtTime(entryStart + entryDuration * 0.6, [150, 90]);
  setEase3D(transform.scale, 3, 0.1);
  transform.scale.setValueAtTime(entryStart + entryDuration, [100, 100]);
  setEase3D(transform.scale, 4, 1);

  var exitDuration = 1;
  var exitStart = compositionConstants.project.duration - exitDuration;
  transform.position.setValueAtTime(exitStart, endPositon);
  transform.position.setValueAtTime(exitStart + exitDuration, startPositon);

  var scaleExitDuration = 0.4;
  var scaleExitStart =
    compositionConstants.project.duration - scaleExitDuration;
  transform.scale.setValueAtTime(scaleExitStart, [100, 100]);
  transform.scale.setValueAtTime(scaleExitStart + scaleExitDuration, [100, 0]);
  setEase(transform.position, 3, 1);
  setEase(transform.position, 4, 0.7);
  setEase3D(transform.scale, 5, 1);
  setEase3D(transform.scale, 6, 0.7);
}

function setupTextAnimation(layer, offset) {
  var offset = offset == undefined ? 0 : offset;
  // Text Animation
  var transform = layer.property("Transform");

  var frame = getFrame(layer);
  var xOffset = 70 * (isRight() ? -1 : 1);
  var startPosition = [frame.right - xOffset, frame.bottom];
  var endPosition = [frame.right, frame.bottom];

  var entryStart = 0.5 + offset;
  var entryDuration = 0.3;
  transform.opacity.setValueAtTime(entryStart, 0);
  transform.opacity.setValueAtTime(entryStart + entryDuration, 100);
  setEase(transform.opacity, 1, 1);
  setEase(transform.opacity, 2, 0.7);
  entryStart += 0.1;
  entryDuration += 0.2;
  transform.position.setValueAtTime(entryStart, startPosition);
  transform.position.setValueAtTime(entryStart + entryDuration, endPosition);
  setEase(transform.position, 2, 0.5);

  var exitDuration = 0.3;
  var exitOffset = 0.3 + offset;
  var exitStart =
    compositionConstants.project.duration - (exitDuration + exitOffset);
  transform.opacity.setValueAtTime(exitStart, 100);
  transform.opacity.setValueAtTime(exitStart + exitDuration, 0);
  setEase(transform.opacity, 3, 1);
  setEase(transform.opacity, 4, 0.7);
}

function setupMaskAndAnimation(layer) {
  var mask = layer.Masks.addProperty("Mask");
  var shapeProperty = mask.property("maskShape");
  shape = shapeProperty.value;
  var frame = getFrame(layer, 0);
  var left = -frame.width;
  var frames =
    compositionConstants.project.duration *
    compositionConstants.project.frameRate;
  var frameTime = 1 / compositionConstants.project.frameRate;
  for (var i = 0; i < frames; i++) {
    var time = frameTime * i;
    var rectangleFrame = getFrame(
      compositionConstants.composition.rectangleLayer,
      time
    );
    var layerFrame = getFrame(layer, time);
    var safetyMargin = 50;
    if (isRight()) {
      var offset = rectangleFrame.right - layerFrame.right;
      shape.vertices = [
        [left - rectangleFrame.width, -frame.height - 100], // Top left
        [left - rectangleFrame.width, 100], // Bottom left
        [offset, safetyMargin], // Bottom Right
        [offset, -(frame.height + safetyMargin)], // Top right
      ];
    } else {
      var offset = rectangleFrame.left - layerFrame.left;

      shape.vertices = [
        [offset - (frame.width - rectangleFrame.width), -frame.height - 100], // Top left
        [offset - (frame.width - rectangleFrame.width), 100], // Bottom left
        [frame.width + safetyMargin, safetyMargin], // Bottom Right
        [frame.width + safetyMargin, -(frame.height + safetyMargin)], // Top right
      ];
    }
    shape.closed = true;
    shapeProperty.setValueAtTime(time, shape);
  }
}

function isRight() {
  return state.orientation === "right";
}

function makeEase(intensity) {
  var initial = intensity;
  return new KeyframeEase(intensity, 0.1 + initial * 99.9);
}

function setEase(property, key, intensity, initial) {
  var ease = makeEase(intensity, initial);
  property.setTemporalEaseAtKey(key, [ease], [ease]);
}

function setEase2D(property, key, intensity, initial) {
  var ease = makeEase(intensity, initial);
  property.setTemporalEaseAtKey(key, [ease, ease], [ease, ease]);
}

function setEase3D(property, key, intensity, initial) {
  var ease = makeEase(intensity, initial);
  property.setTemporalEaseAtKey(key, [ease, ease, ease], [ease, ease, ease]);
}

function createTextLayer(composition, text, font, size) {
  var textLayer = composition.layers.addText(text);
  var sourceText = textLayer.property("Source Text");
  var textProperties = sourceText.value;
  textProperties.font = font;
  textProperties.fontSize = size;
  textProperties.fillColor = [1, 1, 1];
  sourceText.setValue(textProperties);
  return textLayer;
}

function createRectangleLayer(composition, size) {
  var shapeLayer = composition.layers.addShape();

  var vector = shapeLayer.property("Contents").addProperty("ADBE Vector Group");
  vector.name = "Vector";

  var rectangle = shapeLayer
    .property("Contents")
    .addProperty("ADBE Vector Shape - Rect");
  rectangle.name = "Rectangle";
  rectangle.size.setValue([size.width, size.height]);

  var fill = shapeLayer
    .property("Contents")
    .addProperty("ADBE Vector Graphic - Fill");
  fill.name = "Fill";
  fill.color.setValue([21, 125, 193] / 255);

  return shapeLayer;
}

function getFrame(layer, time) {
  var time = time != undefined ? time : 0;
  var sourceRect = layer.sourceRectAtTime(time, true);
  var position = layer.property("Position").valueAtTime(time, true);
  var frame = {
    left: position[0] - sourceRect.width,
    top: position[1] - sourceRect.height,
    right: position[0],
    bottom: position[1],
    width: sourceRect.width,
    height: sourceRect.height,
  };
  return frame;
}

//
// Generic helper functions
//

/**
 * Creates or replaces a named composition
 * @param {string} name The name for the composition
 */
function createOrReplaceComposition(name) {
  var index = indexOfCompositionNamed(name);
  if (indexOfCompositionNamed(name) !== null) {
    ifDebugVerbose(function () {
      alert("will replace existing composition called " + name);
    });
    app.project.item(index).remove();
  }
  var composition = app.project.items.addComp(
    name,
    compositionConstants.project.width,
    compositionConstants.project.height,
    compositionConstants.project.pixelAspect,
    compositionConstants.project.duration,
    compositionConstants.project.frameRate
  );
  composition.selected = true;
  return composition;
}

/**
 * Returns the first index of a composition with a specific name
 */
function indexOfCompositionNamed(name) {
  for (var i = 1; i <= app.project.items.length; i++) {
    if (app.project.items[i].name === name) {
      return i;
    }
  }
  return null;
}

/**
 * Convenience function to run stuff if debug.verbose is true
 * @param {function} doStuff Function to be executed if debug.verbose is set true
 */
function ifDebugVerbose(doStuff) {
  if (compositionConstants.debug.verbose === true) {
    doStuff();
  }
}
