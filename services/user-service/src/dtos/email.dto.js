class EmailDTO {
  constructor(to, subject, html) {
    this.from = process.env.EMAIL_ADDRESS;
    this.to = to;
    this.subject = subject;
    this.html = html;
  }
}

export default EmailDTO;
