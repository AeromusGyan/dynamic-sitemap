
import('node-fetch').then();
const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;
app.use(express.static("public"));
app.use(cors({ origin: true, credentials: true }));

app.listen(port, () => console.log(`app is running on ${port} port`));

const fs = require('fs');
const convert = require('xml-js');
const fetch = require('node-fetch');
const moment = require('moment');

const untrackedUrlsList = [];

const options = { compact: true, ignoreComment: true, spaces: 4 };

/*
    Method to Fetch dynamic List of URLs from Rest API/DB
*/
app.post("/update-sitemap", (req, res) => {
    try {
        fetchCoursesList();
        fetchBlogsList();
        fetchBookList();
        // console.log('Sitemap updated successfully');cls
        res.json({ message: 'Sitemap updated successfully' });
    }
    catch (error) {
        next(error);
        console.error('Error updating sitemap:', error);
        res.status(500).json({ error: 'Error updating sitemap' });
        return;
    }
});

function fetchCoursesList() {
    const hostCourseBaseURL = 'https://www.sciaku.com/watch';
    const getCourseListURL = `https://api.sciaku.com/course/active`;
    fetch(getCourseListURL)
        .then(res => res.json())
        .then(dataJSON => {
            if (dataJSON) {
                dataJSON.forEach(element => {
                    // var a = ', /\[.+?\]/g, "%5B$1%5D", /[\(.+?\)]/g, "%28$1%29"  , /\(/g, "%28", /\)/g, "%29", /\[/g, "%5B", /\]/g, "%5D"';
                    const modifiedURL = element.url;
                    console.log("\nUrl =" + modifiedURL);
                    untrackedUrlsList.push(`${hostCourseBaseURL}/${modifiedURL}`);
                });
                return filterUniqueURLs('weekly', 0.8);
            }
        })
        .catch(error => {
            console.log(error);
        });
}

function fetchBlogsList() {
    const hostBlogBaseURL = 'https://www.sciaku.com/post';
    const getBlogsListURL = `https://api.sciaku.com/post/active`;
    fetch(getBlogsListURL)
        .then(res => res.json())
        .then(dataJSON => {
            if (dataJSON) {
                dataJSON.forEach(element => {
                    // console.log(element);
                    // var a = ', /\[.+?\]/g, "%5B$1%5D", /[\(.+?\)]/g, "%28$1%29"  , /\(/g, "%28", /\)/g, "%29", /\[/g, "%5B", /\]/g, "%5D"';
                    const modifiedURL = element.urlSlug;
                    // const modifiedURLcId = element.courses.cId;
                    // const modifiedURLvId = element.vId;
                    console.log(`\nUrl = ${hostBlogBaseURL}/${modifiedURL}`);
                    untrackedUrlsList.push(`${hostBlogBaseURL}/${modifiedURL}`);
                });
                return filterUniqueURLs('daily', 0.8);
            }
        })
        .catch(error => {
            console.log(error);
        });
}

function fetchBookList() {
    const hostBlogBaseURL = 'https://www.sciaku.com/books/view';
    const getBlogsListURL = `https://api.sciaku.com/books/active`;
    fetch(getBlogsListURL)
        .then(res => res.json())
        .then(dataJSON => {
            if (dataJSON) {
                dataJSON.forEach(element => {
                    // console.log(element);
                    // var a = ', /\[.+?\]/g, "%5B$1%5D", /[\(.+?\)]/g, "%28$1%29"  , /\(/g, "%28", /\)/g, "%29", /\[/g, "%5B", /\]/g, "%5D"';
                    const modifiedURL = element.url;
                    // const modifiedURLcId = element.courses.cId;
                    // const modifiedURLvId = element.vId;
                    console.log(`\nUrl = ${hostBlogBaseURL}/${modifiedURL}`);
                    untrackedUrlsList.push(`${hostBlogBaseURL}/${modifiedURL}`);
                });
                return filterUniqueURLs('monthly', 0.6);
            }
        })
        .catch(error => {
            console.log(error);
        });
}
/*
    Method to Filter/Unique already existing URLs and new urls we fetched from DB
*/
function filterUniqueURLs(changefreq, priority) {
    fs.readFile('browser/sitemap.xml', (err, data) => {
        if (data) {
            const existingSitemapList = JSON.parse(convert.xml2json(data, options));
            let existingSitemapURLStringList = [];
            if (existingSitemapList.urlset && existingSitemapList.urlset.url && existingSitemapList.urlset.url.length) {
                existingSitemapURLStringList = existingSitemapList.urlset.url.map(ele => ele.loc._text);
            }

            untrackedUrlsList.forEach(ele => {
                if (existingSitemapURLStringList.indexOf(ele) == -1) {
                    existingSitemapList.urlset.url.push({
                        loc: {
                            _text: ele,
                        },
                        changefreq: {
                            _text: changefreq
                        },
                        priority: {
                            _text: priority
                        },
                        lastmod: {
                            _text: moment(new Date()).format('YYYY-MM-DD')
                        }
                    });
                }
            });
            return createSitemapFile(existingSitemapList);
        }
    });
}

/*
    Method to convert JSON format data into XML format
*/
function createSitemapFile(list) {
    const finalXML = convert.json2xml(list, options); // to convert json text to xml text
    return saveNewSitemap(finalXML);
}

/*
    Method to Update sitemap.xml file content
*/
function saveNewSitemap(xmltext){
    fs.writeFile('browser/sitemap.xml', xmltext, (err) => {
        if (err) {
            console.log(err)
            return err;
        }
        console.log("The file was saved!");
        return "The file was saved!";
    });
}

// fetchBlogsList();