Jumper
======

Use JumpJS with LeapJS and a Leap motion device (http://www.leapmotion.com) to easily create a Leap interaction box that maps to your browser's viewport. Optionally, create a status message as well as a pointer corresponding to the first finger detected by the device.

The optional pointer depends on FloraJS and Burner. Once the browser recognizes the Leap, you should see "Leap: ready" appear in the top left corner. Just point one finger over the device and watch the pointer track your finger.

Find examples in the 'public' folder or view them in action at http://foldi.github.io/JumpJS/.

Examples
======

To simply set up an interaction box and a status message, create a Jump instance and initialize it.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv='content-type' content='text/html; charset=UTF-8' />
    <title>JumpJS | Simple</title>
    <link href='css/Jump.min.css' rel='stylesheet' type='text/css' charset='utf-8' />
    <script src='scripts/leap.js' type='text/javascript' charset='utf-8'></script>
    <script src='scripts/Jump.min.js' type='text/javascript' charset='utf-8'></script>
  </head>
  <body>
    <script type='text/javascript' charset='utf-8'>
      var jumper = new Jump.Jumper();
      Jump.PubSub.subscribe('animFrame', function(frame) {
        // work with frame data here
      });
      jumper.init();
    </script>
  </body>
</html>
```

To add a pointer, create a Flora system and initialize it with an agent. IMPORTANT: the agent must have a 'jumper' property set to true.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv='content-type' content='text/html; charset=UTF-8' />
    <title>JumpJS | Pointer</title>
    <link href='css/burner.css' rel='stylesheet' type='text/css' charset='utf-8' />
    <link href='css/flora.css' rel='stylesheet' type='text/css' charset='utf-8' />
    <link href='css/Jump.min.css' rel='stylesheet' type='text/css' charset='utf-8' />
    <script src='scripts/leap.js' type='text/javascript' charset='utf-8'></script>
    <script src='scripts/burner.js' type='text/javascript' charset='utf-8'></script>
    <script src='scripts/flora.js' type='text/javascript' charset='utf-8'></script>
    <script src='scripts/Jump.min.js' type='text/javascript' charset='utf-8'></script>
  </head>
  <body>
    <script type='text/javascript' charset='utf-8'>
      var jumper = new Jump.Jumper();
      jumper.init();

      Burner.System.init(function() {

        var pointer = this.add('Agent', {
          width: 20,
          height: 20,
          mass: 2,
          color: [255, 255, 255],
          borderRadius: 100,
          opacity: 0.75,
          jumper: true
        });

      });
    </script>
  </body>
</html>
```

Tweak the properties of the agent to adjust the style of the pointer.

Options
======

The default size of the interaction box is 300mm high x 300mm wide x 300mm deep. The default center of the interaction box is 0mm high x 150mm wide x 0mm deep. This point is equidistant from all sides of the box.

To change the size or center, pass them as properties of an options object when creating a new Jumper.

```javascript
var jump = new Jump.Jumper({
	center: [0, 100, 0],
  size: [200, 200, 200]
});
```

You can also supress the Leap status message by passing false to the init() function.

```javascript
jump.init(false);
```

Building this project
======

This project uses [Grunt](http://gruntjs.com). To build the project first install the node modules.

```
npm install
```

Next, run grunt.

```
grunt
```

A pre-commit hook is defined in /pre-commit that runs jshint. To use the hook, run the following:

```
ln -s ../../pre-commit .git/hooks/pre-commit
```

A post-commit hook is defined in /post-commit that runs the Plato complexity analysis tools. To use the hook, run the following:

```
ln -s ../../post-commit .git/hooks/post-commit
```
