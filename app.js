const puppeteer = require('puppeteer');
const express = require('express')
//const {PuppeteerScreenRecorder} = require('puppeteer-screen-recorder');
const port = process.env.PORT || 9696
const app = express()

app.get('/attendance', async (req, res) => {

    // const allowedOrigins = [
    //   "http://127.0.0.1:3000",
    //   "http://localhost:3000",
    //   "http://127.0.0.1:5000",
    //   "http://localhost:5000",
    //   "http://detain-or-not.vercel.app",
    //   "https://detain-or-not.vercel.app"
    // ];
    // const origin = req.headers.origin;
    // if (allowedOrigins.includes(origin)) {
    //   res.setHeader("Access-Control-Allow-Origin", origin);
    // }
    //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", false);

    const ad_number = req.query.adno
    const pswd = req.query.pswd || "GCET123"
    console.log(ad_number, pswd);
    if (!ad_number) {
      res.status(400).send({ error: "Admission number is not found!" });
    } else {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();

      await page.goto("https://gu.icloudems.com");

      await page.waitForSelector("#useriid");
      await page.focus("#useriid");
      await page.keyboard.type(ad_number);

      
      await page.waitForSelector("#actlpass");
      await page.focus("#actlpass");
      await page.keyboard.type(pswd);
      await page.waitForTimeout(1000);

      await (await page.$("#psslogin")).press("Enter"); // Enter Key
    console.log("Logged in");
    await page.waitForTimeout(2000);
    
    if (
        page
        .url()
        .includes(
            "errormessage=Invalid+Username+or+Password.Please+try+again."
            )
            )
            res.status(400).send("Invalid Login Credentials");
            else {
                //loder style display to none
                let attr = await page.$$eval("div.preloader-backdrop", el => el.map(x => x.getAttribute("style")));
                while (attr[0] == null) {
                  attr = await page.$$eval("div.preloader-backdrop", el => el.map(x => x.getAttribute("style")));
                }
                // await page.goto(
                //     "https://gu.icloudems.com/corecampus/student/attendance/subwise_attendace_new.php"
                //     );
                //     console.log("in attendance");
                
                //await page.click("#select2-acadyear-container")
                //await (await page.$('.select2-selection__rendered')).press('Enter'); // Enter Key (return key)
                //await (await page.$('#select2-acadyear-result-npqk-2021-2022')).press('Enter'); // Enter Key
                    console.log("in home");
                    await page.waitForTimeout(500);
                    let att = await page.$x('/html/body/div[1]/div/div/div[4]/div/div/div[4]/a')
                    await page.waitForTimeout(500);
                    await att[0].press("Enter");
                    await page.waitForTimeout(500);
                    //const optionsBtn = await page.$x("/html/body/div[1]/div[1]/div/div[3]/div[2]/div[1]/div/div/button");
                    //await page.waitForTimeout(3500);
                    //await optionsBtn[0].press("Enter");
                    
                    
                    //loder style display to none
                    console.log("in attendance");
                    await page.waitForTimeout(500);
                    let attr1 = await page.$$eval("div.preloader-backdrop", el => el.map(x => x.getAttribute("style")));
                    console.log(attr1);
                    while (attr1[0] == null) {
                      attr1 = await page.$$eval("div.preloader-backdrop", el => el.map(x => x.getAttribute("style")));
                      console.log("waiting...");
                    }
                    
                    console.log("in attendance no loader");
                    
                    // attr = await page.$$eval("div.preloader-backdrop", el => el.map(x => x.getAttribute("style")));
                    // console.log(attr.length);
                    
                    await page.waitForTimeout(1000);
                                  
                    let options = await page.$x("/html/body/div[1]/div/div[1]/div[3]/div[2]/div[2]/form/div/div[1]/div/span");

                    await page.waitForTimeout(1000);
                    await options[0].click();
                    await page.waitForTimeout(1000);
                    while (options.length == 0) {
                      options = await page.$x("/html/body/div[1]/div[1]/div/div[3]/div[2]/div[1]/div/div/div/a[2]");
                    }
                    
                    await options[0].click();
                    await page.waitForTimeout(1000);
                    //get all values of a select menu
                    const years = await page.evaluate(() => {
                      const select = document.querySelector('#acadyear');
                      return Array.from(select.options).map(o => o.value);
                   });
                    await page.select("#acadyear", years[0]);
                    await page.waitForTimeout(500);
                    //get all values of a select menu
                    const values = await page.evaluate(() => {
                       const select = document.querySelector('#classid');
                       return Array.from(select.options).map(o => o.value);
                    });
                    await page.waitForTimeout(500);
                    await page.select("#classid", await values[values.length-1]);
                    await page.waitForTimeout(500);
                    await (await page.$("#getattendance")).press("Enter"); // Enter Key
                    console.log("fetched attendace");
                    
                    await page.waitForTimeout(1000);
                    console.log("fetching table");

        const result = await page.$$eval(".table tr", (rows) => {
          return Array.from(rows, (row) => {
            const columns = row.querySelectorAll("td");
            return Array.from(columns, (column) => column.textContent);
          });
        });

        console.log(result)

        let final = [];

        let final_percentage = {
          total_classes: "",
          percentage: "",
        };

        //get photo and name as well

        //const img = await page.$$eval('.rounded-circle.rounded.img-rounded.image-cropper > img[src]', imgs => imgs.map(img => img.getAttribute('src')));

        const images = await page.$$eval("img", (anchors) =>
          [].map.call(anchors, (img) => img.src)
        );

        const dp =
          images[
            images.findIndex((element) => element.includes("/student_profile"))
          ];

        const name = await page.evaluate(() => {
          const elements = document.getElementsByClassName(
            "d-none d-lg-inline-block mr-2"
          );
          return Array.from(elements).map((element) => element.innerText);
        });

        for (let i = 0; i < result.length; i++) {
          let data = {
            serial_number: "",
            name: "",
            subject_code: "",
            code: "",
            classes: "",
            percentage: "",
          };
          for (let j = 0; j < result[i].length; j++) {
            if (i === result.length - 1) {
              if (j !== 0)
                final_percentage[Object.keys(final_percentage)[j - 1]] =
                  result[i][j];
            } else data[Object.keys(data)[j]] = result[i][j];
          }
          if (!isEmpty(final_percentage)) {
            final.push(final_percentage);
          }
          if (!isEmpty(data)) {
            final.push(data);
          }
        }

        let metadata = { name, dp };
        final.push({ metadata });

        res.status(200).send({ response: final });
      }
      await browser.close();
    }
})

function isEmpty(obj) {
    for (let key in obj) {
        if (obj[key] !== null && obj[key] !== "")
            return false;
    }
    return true;
}

app.listen(port, () => {
    console.log(`Listening @ ${port}!`)
})