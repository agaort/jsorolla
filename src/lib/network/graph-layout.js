/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

//function GraphLayout(args) {
//    _.extend(this, Backbone.Events);
//    this.id = Utils.genId('GraphLayout');
//
//    this.verticesList = [];
//
//    //set instantiation args, must be last
//    _.extend(this, args);
//
//    this.vertices = {};
//
//    this._init();
//
//    this.on(this.handlers);
//}

GraphLayout = {
    _init: function () {
        for (var i in this.verticesList) {
            var vertex = this.verticesList[i];
            if (typeof vertex.x === 'undefined') {
                vertex.x = 0;
            }
            if (typeof vertex.y === 'undefined') {
                vertex.y = 0;
            }
            if (typeof vertex.z === 'undefined') {
                vertex.z = 0;
            }
            this.vertices[vertex.id] = vertex;
        }
    },
    getRandomArbitrary: function (min, max) {
        return Math.random() * (max - min) + min;
    },
    applyRandom3d: function () {
        for (var i in this.vertices) {
            var vertex = this.vertices[i];
            vertex.x = this.getRandomArbitrary(-300, 300);
            vertex.y = this.getRandomArbitrary(-300, 300);
            vertex.z = this.getRandomArbitrary(10, 600);
        }
    },
    sphereSurface: function (vertices, network, radius, offsetZ) {

        //        θ = theta
        //        φ = phi
        var n = vertices.length;

        for (var i = 0; i < vertices.length; i++) {
            var vertex = vertices[i];
            var vertexConfig = network.config.getVertexConfig(vertex);
            var coords = vertexConfig.coords;

            var phi = Math.acos(-1 + ( 2 * i ) / n);
            var theta = Math.sqrt(n * Math.PI) * phi;
            coords.x = radius * Math.cos(theta) * Math.sin(phi);
            coords.y = radius * Math.sin(theta) * Math.sin(phi);
            coords.z = radius * Math.cos(phi) + offsetZ;
        }
    },
    random2d: function (network, width, height) {
        var vertices = network.graph.vertices;
        var x, y;
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            x = this.getRandomArbitrary(0, width);
            y = this.getRandomArbitrary(0, height);
            vertex.position.x = x;
            vertex.position.y = y;
            vertex.renderer.move();
            network._updateEdgeCoords(vertex);
        }
    },
    circle: function (network, width, height, orderedVertices) {
        var vertices = network.graph.vertices;
        if (typeof orderedVertices !== 'undefined') {
            vertices = orderedVertices;
        }

        var radius = (height - 100) / 2;
        var centerX = width / 2;
        var centerY = height / 2;
        var x, y, vertex;
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = network.graph.getVertexById(vertices[i].id);
            x = centerX + radius * Math.sin(i * 2 * Math.PI / vertices.length);
            y = centerY + radius * Math.cos(i * 2 * Math.PI / vertices.length);
            vertex.position.x = x;
            vertex.position.y = y;
            vertex.renderer.move();
            network._updateEdgeCoords(vertex);
        }
    },
    force: function (args) {
        var network = args.network;
        var graph = args.network.graph;
        var vAttr = args.network.vAttr;
        var eAttr = args.network.eAttr;
        var width = args.width;
        var height = args.height;
        var friction = args.friction;
        var gravity = args.gravity;
        var chargeDistance = args.chargeDistance;

        var linkStrength = args.linkStrength;
        var linkDistance = args.linkDistance;
        var charge = args.charge;

        var multipliers = args.multipliers;

        var endFunction = args.end;
        var simulation = args.simulation;

        var config = typeof args.config === 'undefined' ? {vertices: {}, edges: {}} : args.config;

        if (typeof network === 'undefined') {
            console.log('graph not defined');
            return;
        }
        var verticesArray = [];
        var verticesMap = [];
        var edgesArray = [];

        var force = d3.layout.force();

        //Global parameters
        force.size([width, height]);
        if (typeof  friction !== 'undefined') {
            force.friction(friction);

        }
        if (typeof gravity !== 'undefined') {
            force.gravity(gravity);

        }
        if (typeof  chargeDistance !== 'undefined') {
            force.chargeDistance(chargeDistance);

        }


        var vertices = network.graph.vertices;
        var edges = network.graph.edges;


        /*------------------------------------------*/
        /*------------------------------------------*/
        console.time('Force directed preload');

        //set node and edge arrays for D3
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            var v = {
                id: vertex.id,
                index: i,
                x: vertex.position.x,
                y: vertex.position.y
            };
            verticesArray.push(v);
            verticesMap[vertex.id] = v;
        }
        force.nodes(verticesArray);
        for (var i = 0, l = edges.length; i < l; i++) {
            var edge = edges[i];
            if (typeof edge !== 'undefined') {
                edgesArray.push({
                    id: edge.id,
                    source: verticesMap[edge.source.id],
                    target: verticesMap[edge.target.id]
                });
            }
        }
        force.links(edgesArray);

        /* Node and Edge specific parameters */
        //Link Distance
        if (typeof linkDistance !== 'undefined') {
            if (!isNaN(linkDistance)) {
                force.linkDistance(linkDistance);
            } else {
                //is and attributName
                force.linkDistance(function (e) {
                    var edge = graph.getEdgeById(e.id);
                    var value = vAttr.getRow(edge.id)[linkDistance];
                    var ld = isNaN(value) ? (edge.source.renderer.size + edge.target.renderer.size) * 1.5 : value * multipliers.linkDistance;
                    return ld;
                });
            }
        } else {
            force.linkDistance(function (e) {
                var edge = graph.getEdgeById(e.id);
                return edge.source.renderer.size + edge.target.renderer.size * 1.5;
            })
        }
        //Link Strength
        if (typeof linkStrength !== 'undefined') {
            if (!isNaN(linkStrength)) {
                force.linkStrength(linkStrength);
            } else {
                //is and attributName
                force.linkStrength(function (e) {
                    var value = vAttr.getRow(e.id)[linkStrength];
                    var ls = isNaN(value) ? 1 : value * multipliers.linkStrength;
                    return ls;
                });
            }
        }
        //Node Charge
        if (typeof charge !== 'undefined') {
            if (!isNaN(charge)) {
                force.charge(charge);
            } else {
                //is and attributName
                force.charge(function (v) {
                    var vertex = graph.getVertexById(v.id);
                    var value = eAttr.getRow(vertex.id)[charge];
                    var c = isNaN(value) ? vertex.renderer.getSize() * -10 : value * multipliers.charge;
                    return c;
                });
            }
        } else {
            force.charge(function (v) {
                var vertex = graph.getVertexById(v.id);
                return vertex.renderer.getSize() * -10;
            });
        }
        console.timeEnd('Force directed preload');
        /*------------------------------------------*/
        /*------------------------------------------*/


        force.on('end', function (o) {
            console.log(o)
            endFunction(verticesArray);
        });

        if (simulation === true) {
            force.on('tick', function (o) {
                endFunction(verticesArray);
                console.log(force.alpha())
                if (force.alpha() < 0.025) {
                    force.stop()
                }
            });
            force.start();
        } else {
            console.time('D3 Force directed layout');
            force.start();
            var safety = 0;
            while (force.alpha() > 0.025) { // You'll want to try out different, "small" values for this
                force.tick();
                if (safety++ > 1000) {
                    break;// Avoids infinite looping in case this solution was a bad idea
                }
            }
//            console.log(safety);
            force.stop();
            console.timeEnd('D3 Force directed layout');
        }

    },
    tree: function (args) {
        var network = args.network;
        var graph = network.graph;
        var vAttr = network.vAttr;
        var eAttr = network.eAttr;
        var width = args.width;
        var height = args.height;
        var vertices = graph.vertices;
        var edges = graph.edges;


        var treeData = this._getTreeNode(args.root, {});


        var tree = d3.layout.tree()
            .sort(null)
            .size([width, height]);
        //.children(function(d)
        //{
        //    return (!d.edges || d.edges.length === 0) ? null : d.edges.target;
        //}
        //);

        var nodes = tree.nodes(treeData);
        args.end(nodes);

        //var links = tree.links(nodes);


    },
    _getTreeNode: function (vertex, visited) {
        var children = [];
        if (visited[vertex.id] != true) {
            visited[vertex.id] = true;
            for (var i = 0; i < vertex.edges.length; i++) {
                var edge = vertex.edges[i];
                if (edge.target !== vertex && visited[edge.target.id] != true) {
                    children.push(this._getTreeNode(edge.target, visited));
                }
                if (edge.source !== vertex && visited[edge.source.id] != true) {
                    children.push(this._getTreeNode(edge.source, visited));
                }
            }
        }
        var node = {
            name: vertex.id,
            children: (children.length === 0) ? null : children
        }
        return node;
    }

}