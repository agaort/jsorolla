/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
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

function DqsManager(){
	
	this.manager = new DqsRestManager();
	
	this.onBamList = this.manager.onBamList;
	this.onRegion = this.manager.onRegion;

	this.onError = this.manager.onError;
}

DqsManager.prototype.bamList = function (queryParams) {
	this.manager.bamList(queryParams);
};
DqsManager.prototype.region = function (category, filename, region, queryParams) {
	this.manager.region(category, filename, region, queryParams);
};



DqsManager.prototype.getHost = function(){
	return this.manager.getHost();
};
DqsManager.prototype.setHost = function(hostUrl){
	 return this.manager.setHost(hostUrl);
};