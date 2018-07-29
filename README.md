# Draw Canvas

A library that allows the user to draw on a canvas, and extract the drawn points. Useful for getting handwritten user input.

Clone the repository and open the `.html` files on your browser to see examples.

## Download

```bash
npm install portraycanvas --save
```

## Usage

Your html:

```html
<canvas id="canvas-main" style="width: 100%; border: 1px solid black;" height="200"></canvas>
```

Your Javascript:

```js
var canvas = new PortrayCanvas(document.getElementById("canvas-main"), {

  // All these attributes are optional.

  // Stroke size
  lineWidth: 2,

  // Set the color
  color: '#00ff00',

  // Period in which it collects points. The lower, the more points it collects.
  // If it's too high, you might not get curved lines accurately.
  period: 5,

  // Some events...

  onLineFinish: function(c){
    console.log("A line was finished, here are all the lines:");
    console.log(c.getLines());
  },

  onClear: function(){
    console.log("The canvas was cleared");
  },

  onUndo: function(line){
    console.log("This line was deleted:");
    console.log(line);
  }
});
```

You can programmatically call these methods:

```js
canvas.clear(); // Clear the canvas

canvas.undo(); // Remove last line you drew

canvas.setColor('#ff0000'); // Change the stroke color

canvas.revertDefaultColor(); // If you had changed the color, go back to the default one.
```

## Styling

You can initialize the canvas using the `color` option (as explained above), but you can use a `css` class in order to keep it consistent with the rest of your application:

```css
.green-canvas {
  /* If you include the 'color' property, it'll be
  used as the stroke color */
  color: #006600;
  background-color: #fafafa;
  border: 3px solid black;
  cursor: crosshair;
}
```

And then in your HTML:

```html
<canvas id="canvas-main" class="green-canvas" width="800" height="500"></canvas>
```

## Recommended CSS

You can make the canvas unselectable by applying the following CSS:

```css
.my-canvas{
  -webkit-user-select: none;  /* Chrome all / Safari all */
  -moz-user-select: none;     /* Firefox all */
  -ms-user-select: none;      /* IE 10+ */
  user-select: none;          /* Likely future */      
}
```

You can make the canvas unscrollable, which is useful for mobile pages, so that it doesn't unintentionally scroll while touching it, by applying the following CSS to your canvas.

```css
.my-canvas{
  touch-action: none;
}
```

In future versions, these CSS rules will be applied automatically by the library.
