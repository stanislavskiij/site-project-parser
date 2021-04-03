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
  pages = 3;
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
  let htmlText = '';
  // console.log(arrAns);
  htmlText +=`<style>
              body{
                margin: 0;
              }
              div{
                margin: 0;
                padding: 10px;
                color: #525252;
              }
              .place{
                -webkit-box-shadow: 0px 5px 10px 2px rgba(34, 60, 80, 0.2);
                -moz-box-shadow: 0px 5px 10px 2px rgba(34, 60, 80, 0.2);
                box-shadow: 0px 5px 10px 2px rgba(34, 60, 80, 0.2);
              }
              </style>`;

  htmlText +=`<div style="background-color: #cef3f0; display: flex; justify-content: center; flex-direction: column; padding-bottom: 30px;">';
                <h1 style="text-align: center; font-size: 80px;">Главная информация о компании:</h1>';
                <div style="display: flex; width: 1000px; margin: 0 auto; background-color: #b7d9d6; border-radius: 20px; flex-direction: column;" class="place">
                  <h1 style="color: #525252;">Наименование: ${arrAns[0].name}</h1>
                  <h1 style="color: #525252;">Код: ${arrAns[0].directoryCode}</h1>
                  <h1 style="color: #525252;">${arrAns[0].InnAndKpp}</h1>
                </div>;
                <h1 style="text-align: center; color: #525252;">Все данные были полученны со страницы: <a href="https://clearspending.ru${link}?contracts_page=1&tab=contracts" target="__blank" style="color: #525252;">https://clearspending.ru${link}?contracts_page=1&tab=contracts</a></h1>;
              </div>`;
  // console.log(arrAns[1].length);                   
  let elem = arrAns[1];
  htmlText +=`<div style="background-color: #ade6e6; display: flex; flex-direction: column;">
              <h1 style="text-align: center; font-size: 80px;">Информация о закупках:</h1>`;
  for(let i = 0; i < arrAns[1].length; ++i){
    htmlText += `<div style="width: 1000px; margin: 0 auto;">
                    <div style="background-color: #9fd1d1; border-radius: 20px; width: 1000px;" class="place">
                      <h1 style="color: #525252; padding: 5px;">Номер контракта: ${elem[i].contractNumber}</h1>
                      <h1 style="color: #525252; padding: 5px;">Поставщик: ${elem[i].provider}</h1>
                      <h1 style="color: #525252; padding: 5px;">Цена: ${elem[i].cost}</h1>
                    </div>
                  </div>`
  }
  htmlText += `</div>`;
  ans = JSON.stringify(arrAns);
  res.send(`${htmlText}`)
  // console.log(arrOfElements);
};

parse();

});



module.exports = router;
