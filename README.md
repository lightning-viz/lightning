# Lightning

A notebook for storing and sharing custom visualizations

http://lightning.mathisonian.com

## mockups

### Stream of output for current interactive session

![feed](./mocks/feed.png)

### overview of an interactive session

![overview](./mocks/overview.png)

### sidebar showing options

![sidebar](./mocks/sidebar.png)

### permalink page for sharing 

![viz](./mocks/viz-permalink.png)


## installation

dependencies

* [node.js](http://nodejs.org/)
* [mongodb](http://www.mongodb.org/)


install by running `npm install`. Make sure mongo is running then launch the app by running

```
gulp
```

## chart types

### scatter

```javascript
{
  "data": [
    {"x": 10, "y": 5},
    {"x": 11, "y": 4},
    {"x": -3, "y": 0}
  ],
  "type": "scatter"
}
```

### line

```javascript
{
  "data": [1, 7, 8, 9, 11, -10, -3, 11, 2, 100, 0, 1, 20, 25, 27, 80, -10, 20, 30, 40, 30, 43, 50],
  "type": "line"
}
```

### PCA

exact data format tbd
```javascript
{
  "data": {
    "points": [
      {"x": 10, "y": 5, "category": 0}, 
      {"x": 11, "y": 4, "category": 1},
      {"x": -3, "y": 0, "category": 2}
      
    ],
    "categories": [
      [1, 3, 4, 6, 7],
      [1, 0, 4, 8, 6],
      [2, 3, 3, 7, 9]
    ]
  }
  "type": "pca"
}
```
