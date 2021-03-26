const express = require('express');
const router = express.Router();
const { checkedAuth, straightAuth } = require('../config/auth');
const { PythonShell } = require('python-shell');
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");
router.get('/', straightAuth, (req, res) => res.render('firstPage'));

router.get('/PersonalArea', checkedAuth, (req, res) =>
  res.render('PersonalArea', {
    user: req.user
  })
);

router.get('/parse/:inn', (req, res)=>{
  console.log(123);
  let inn = req.params.inn;
  let ans;
  

  const parse = async () => {
  const getHTML = async (url) => {
    const { data } = await axios.get(url);
    return cheerio.load(data);
  };

  const a = await getHTML(
    `https://clearspending.ru/customer/?namesearch=&search-submit=&regioncode=&address=&subordination=&inn=${inn}&kpp=&orgtype=&okogu=&okved=&spzregnum=&sort=&filter=True`
  );
  let link = "";
  a("table")
    .find("tbody")
    .find("tr")
    .find("td")
    .find("a")
    .each((i, e) => {
      if (i == 0) {
        console.log(a(e).attr('href'), '\n------------------------------\n');
        link = a(e).attr("href");
      }
    });

  // console.log(link);

  // парсер с линки, сайта, которую я создал
  const $ = await getHTML(
    `https://clearspending.ru${link}?contracts_page=1&tab=contracts`
  );
  let pages;
  let arrayPages = [];
  const analizeAllPage = $(".pagination").each((i, e) => {
    // console.log(i);
    if (i == 1) {
      //   console.log($(e).html());
      $(e)
        .find("li")
        .each((index, element) => {
          // console.log($(element).text());
          arrayPages.push($(element).text());
        });
    }
  });
  pages = arrayPages[arrayPages.length - 2];
  let arrOfElements = [];
  pages = 5;
  let arrAns = [];
  let mainCustomer = {};

    $(".col-m-12")
      .find("tbody")
      .find("tr")
      .each((index, element) => {
        if (index == 0) {
          $(element)
            .find("td")
            .each((ind, elementEnd) => {
              if (ind == 1) {
                mainCustomer.name = $(elementEnd).text();
              }
            });
        }
        if (index == 1) {
          $(element)
            .find("td")
            .each((ind, elementEnd) => {
              if (ind == 1) {
                mainCustomer.directoryCode = $(elementEnd).text();
              }
            });
        }
        if (index == 2) {
          // console.log($(element).text());
          mainCustomer.InnAndKpp = $(element).text();
        }
        // console.log($(element).html(), '-----------------------\n');
      });

    // console.log(mainCustomer);
    arrAns.push(mainCustomer);
  for (let indexx = 1; indexx <= pages; ++indexx) {
    const $ = await getHTML(
      `https://clearspending.ru${link}?contracts_page=${indexx}&tab=contracts`
    );
    console.log(
      `https://clearspending.ru${link}?contracts_page=${indexx}&tab=contracts`
    );
    
    //   console.log(pagesNumber.html());
    //   console.log(pages)

    let table;
    $(".tab-pane").each((i, e) => {
      // console.log(i);
      if (i == 3) {
        $(e)
          .find("tbody")
          .find("tr")
          .each((index, element) => {
            let arrTemp1 = [];
            let arrTemp2 = [];
            let arrTemp3 = [];
            // console.log(index);
            $(element)
              .find("td")
              .each((indx, elemnt) => {
                // console.log($(elemnt).html());

                if (indx == 0) {
                  $(elemnt)
                    .find("b")
                    .each((ind, elem) => {
                      // console.log($(elem).text());
                      if (ind == 0 || ind == 1) {
                        arrTemp1.push($(elem).html());
                      }
                    });

                  $(elemnt)
                    .find("a")
                    .each((ind, elem) => {
                      // console.log($(elem).text());
                      if (ind == 0 || ind == 1) {
                        arrTemp2.push($(elem).html());
                      }
                    });

                  // console.log(arrTemp1, "---------------------");
                  // console.log(arrTemp2);

                  // console.log(arrTemp1.length);
                } else {
                  arrTemp3.push($(elemnt).text());
                  // console.log($(elemnt).text());
                }
              });

            /*console.log(arrTemp3);
            let arrTemp4 = [];
            for(let ind = 0; ind < arrTemp1.length; ind++){
              arrTemp4.push({section: arrTemp1[ind], info: arrTemp2[ind]}) - прошлый алгоритм, устарел
            }
            arrTemp4.push({section: "Цена:", info: arrTemp3[0]});*/

            let obj = {};
            obj.contractNumber = arrTemp2[0];
            obj.provider = arrTemp2[1];
            // console.log(typeof(arrTemp3[0]));
            obj.cost = arrTemp3[0].split("\n").join("").split(",").join("");
            arrOfElements.push(obj);

            // console.log($(element).html(), '--------------------------');
            // let obj = {number: $(eleme)};
            // arrOfElememts.push()
          });
      }
    });
  }
  
  arrAns.push(arrOfElements);
  ans = JSON.stringify(arrAns);
  res.send(`<h1>${ans}</h1 `)
  // console.log(arrOfElements);
};

parse();

});



module.exports = router;
