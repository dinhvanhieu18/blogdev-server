const sendGrid = require('@sendgrid/mail')
sendGrid.setApiKey(`${process.env.SENDGRID_KEY}`)

const SENDER_EMAIL = `${process.env.SENDGRID_SENDER}`

const sendEmail = async (to: string, url: string, subject: string, txt: string) => {
    const msg = {
        to: to,
        from: {
            email: SENDER_EMAIL,
            name: "BlogDev"
        },
        subject: subject,
        html: `
              <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
              <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to the BlogDev.</h2>
              <p>
                 Hi, This email is sended from BlogDev to serve your request. Just click your button below.
              </p>
              
              <a href=${url} style="background: green; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${txt}</a>
          
              <p>If the button doesn't work for any reason, you can also click on the link below:</p>
          
              <div>${url}</div>
              </div>
            `,
    }

    try {
        sendGrid.send(msg).then((res: any) => {
            console.log(res[0].statusCode)
            console.log(res[0].headers)
        })
    } catch (err) {
        console.log(err)
    }
}

export default sendEmail;