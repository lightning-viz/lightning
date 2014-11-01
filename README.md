# Lightning

A notebook server for storing and sharing custom data visualizations

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

![session](http://i.gif.fm/KvPpI.png)

## client libraries

Python
* https://github.com/mathisonian/lightning-python


## installation

dependencies

* [node.js](http://nodejs.org/)
* gulp build system
    * to install run `npm install --global gulp` once node.js is installed (may need sudo)
* postgres
    * Create a database named `lightning-viz` by running `CREATE DATABASE "lightning-viz";`


Install libraries by running `npm install`. 

Compile client side libraries by running `gulp`. This can will continue to watch for changes of client side files.

Run server with `npm start`. Open your browser to [http://localhost:3000](http://localhost:3000)


## viz types

With companion code from the [python client](https://github.com/mathisonian/lightning-python)

### scatter

![scatter](http://i.gif.fm/rNhO7.png)

```python
x = [randrange(100) for _ in xrange(50)]
y = [randrange(100) for _ in xrange(50)]

lightning.scatter(x, y)
```


### line

![line](http://i.gif.fm/che9k.png)

```python
lightning.plot(type="line", data=[randrange(100) for x in xrange(50)])
```

### mix+match and server backed

Simple visualizations can be linked together to create new interactions

![gif](http://i.imgur.com/XWquFgx.gif)

```python

points = [{ 'x': randrange(100), 'y': randrange(100), 'i': i} for i in xrange(50)]
timeseries = [[uniform(-1, 1) for _ in xrange(1000)] for _ in xrange(50)]

data = {
    'points': points,
    'timeseries': timeseries
}

lightning.plot(data=data, type='roi')
```

### force directed network

![network](http://i.imgur.com/ftfVOOg.gif)


```python
import numpy as np

mat = np.array([[random.uniform(0, 15) if random.random() > 0.8 else 0 for _ in xrange(15)] for _ in xrange(15)])
viz = lightning.network(mat)
```

### maps

US and World Maps

![us map](http://i.gif.fm/cqPbH.png)
![world map](http://i.gif.fm/43r3E.png)

```python
countries = ["USA", "MEX", "CAN", "GER", "AUS", "BRA", "ARG", "PER", "SPA", "POR", "FRA", "ITA", "RUS", "CHN", "IND"]
mapDict = dict((country, random.random()) for country in countries)

viz = lightning.plot('map', data=mapDict)
```

### matrices

![matrices](http://i.gif.fm/2DO3W.png)

```python
mat = np.array([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]])
viz = lightning.matrix(mat)
```

### bitmaps

![bmp](http://i.gif.fm/yyl7z.png)

```python
img1 = random.rand(256, 256)
img2 = random.rand(256, 256)

viz = lightning.image([img1, img2], type='gallery')
```
