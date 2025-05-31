
interface RuleBasedResponse {
  response: string;
  isRuleBased: boolean;
}

export class ChatService {
  private static enrollmentResponses = [
    "For enrollment at PUPQC, you need to take the PUPCET (PUP College Entrance Test). Applications are usually open from January to February. Required documents include Form 138, Good Moral Certificate, Birth Certificate, and 2x2 photos. For more details, contact PUPQC at (02) 8287-1717 or visit www.pup.edu.ph.",
    "PUPQC enrollment requires passing the PUPCET exam first. The entrance exam is typically held annually. You'll need your high school records (Form 138), good moral certificate, birth certificate, and passport-sized photos. Visit the PUPQC campus at Don Fabian, Quezon City for more information.",
    "To enroll at PUPQC: 1) Take and pass the PUPCET, 2) Submit required documents (Form 138, Good Moral, Birth Certificate, photos), 3) Complete the enrollment process. PUPCET applications open around January-February. Contact (02) 8287-1717 for current schedules."
  ];

  private static admissionResponses = [
    "PUPQC admission is through the PUPCET (PUP College Entrance Test). The exam tests general knowledge and basic skills. Passing score varies by program. Applications typically open January-February. For current admission requirements and schedules, contact PUPQC at (02) 8287-1717.",
    "Admission to PUPQC requires passing the PUPCET entrance examination. The test covers mathematics, English, science, and general knowledge. Different programs may have different cut-off scores. Visit the PUPQC Registrar's Office for specific admission requirements.",
    "PUPCET is the entrance exam for PUPQC admission. It's usually held once a year with applications opening early in the year. The exam assesses your readiness for university-level education. Check www.pup.edu.ph for the latest admission guidelines."
  ];

  private static programsResponses = [
    "PUPQC offers various undergraduate programs including BS Information Technology, BS Business Administration, BS Accountancy, BS Elementary Education, BS Secondary Education, BS Entrepreneurship, and more. Each program has specific requirements and duration. Contact the Registrar's Office for a complete list.",
    "Popular programs at PUPQC include IT, Business Administration, Accountancy, Education, and Entrepreneurship. PUPQC is known for quality education at affordable rates. Visit the campus or call (02) 8287-1717 to learn about specific program requirements and curricula.",
    "PUPQC provides undergraduate degrees in technology, business, education, and other fields. The university is recognized for its practical approach to education and industry-relevant curriculum. Check with the academic departments for detailed program information."
  ];

  private static tuitionResponses = [
    "PUPQC offers free tuition! This program is part of the Universal Access to Quality Tertiary Education Act (RA 10931), which mandates free higher education for students in state universities and colleges. Additional fees may apply for laboratory, library, and other services. Contact the Finance Office for exact current rates.",
    "As a state university, PUPQC provides FREE tuition under the Universal Access to Quality Tertiary Education Act. This makes quality higher education accessible to all Filipino students regardless of financial capacity. Other minimal fees like registration and laboratory fees may apply.",
    "Great news! PUPQC tuition is FREE under RA 10931 (Universal Access to Quality Tertiary Education Act). This law provides free higher education in all state universities and colleges. Only minimal fees for laboratory, library, and other services may apply."
  ];

  private static locationResponses = [
    "PUPQC is located at Don Fabian, Quezon City, 1121 Metro Manila. The campus is accessible by public transportation including jeepneys and buses. You can contact them at (02) 8287-1717 or visit www.pup.edu.ph for directions and campus maps.",
    "The PUPQC campus is situated in Don Fabian, Quezon City, 1121 Metro Manila. It's easily reachable by various public transport options. For specific directions to the campus, you can call (02) 8287-1717 or check their website.",
    "PUPQC address: Don Fabian, Quezon City, 1121 Metro Manila. The campus serves the northern part of Metro Manila and nearby provinces. Public transportation is readily available to reach the university."
  ];

  private static scholarshipResponses = [
    "PUPQC offers various scholarship programs including academic scholarships, need-based financial aid, and government scholarship programs like CHED and DOST scholarships. Visit the Student Affairs Office or contact (02) 8287-1717 for current scholarship opportunities and application procedures.",
    "Scholarship opportunities at PUPQC include merit-based awards for top students, financial assistance for deserving students, and external scholarships through government agencies. The Scholarship Office can provide detailed information about eligibility and application requirements.",
    "PUPQC provides multiple scholarship options to help students with their education costs. These include university scholarships, government grants, and private foundation scholarships. Check with the Student Services for available programs."
  ];

  private static servicesResponses = [
    "PUPQC offers various student services including the Student Information System (SIS) for checking grades and schedules, library services, health services, guidance counseling, and student organizations. The campus also has computer laboratories and research facilities.",
    "Student services at PUPQC include online grade checking through SIS, comprehensive library resources, health and wellness programs, career guidance, and various student clubs and organizations. The university also provides academic support services.",
    "PUPQC provides essential student services such as the Student Information System for academic records, library and research facilities, health services, counseling, and extracurricular activities through various student organizations and clubs."
  ];

  private static getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  public static getRuleBasedResponse(message: string): RuleBasedResponse {
    const lowerMessage = message.toLowerCase();

    // Enrollment keywords
    if (lowerMessage.includes('enroll') || lowerMessage.includes('enrollment') || 
        lowerMessage.includes('register') || lowerMessage.includes('registration')) {
      return {
        response: this.getRandomResponse(this.enrollmentResponses),
        isRuleBased: true
      };
    }

    // Admission keywords
    if (lowerMessage.includes('admission') || lowerMessage.includes('admit') || 
        lowerMessage.includes('entrance') || lowerMessage.includes('pupcet') ||
        lowerMessage.includes('entrance exam') || lowerMessage.includes('entrance test')) {
      return {
        response: this.getRandomResponse(this.admissionResponses),
        isRuleBased: true
      };
    }

    // Programs/Courses keywords
    if (lowerMessage.includes('program') || lowerMessage.includes('course') || 
        lowerMessage.includes('degree') || lowerMessage.includes('major') ||
        lowerMessage.includes('curriculum') || lowerMessage.includes('bachelor')) {
      return {
        response: this.getRandomResponse(this.programsResponses),
        isRuleBased: true
      };
    }

    // Tuition/Fees keywords
    if (lowerMessage.includes('tuition') || lowerMessage.includes('fee') || 
        lowerMessage.includes('cost') || lowerMessage.includes('price') ||
        lowerMessage.includes('payment') || lowerMessage.includes('expense')) {
      return {
        response: this.getRandomResponse(this.tuitionResponses),
        isRuleBased: true
      };
    }

    // Location keywords
    if (lowerMessage.includes('location') || lowerMessage.includes('address') || 
        lowerMessage.includes('where') || lowerMessage.includes('direction') ||
        lowerMessage.includes('campus') || lowerMessage.includes('don fabian')) {
      return {
        response: this.getRandomResponse(this.locationResponses),
        isRuleBased: true
      };
    }

    // Scholarship keywords
    if (lowerMessage.includes('scholarship') || lowerMessage.includes('financial aid') || 
        lowerMessage.includes('grant') || lowerMessage.includes('allowance') ||
        lowerMessage.includes('financial assistance') || lowerMessage.includes('scholar')) {
      return {
        response: this.getRandomResponse(this.scholarshipResponses),
        isRuleBased: true
      };
    }

    // Services keywords
    if (lowerMessage.includes('service') || lowerMessage.includes('sis') || 
        lowerMessage.includes('library') || lowerMessage.includes('facility') ||
        lowerMessage.includes('grade') || lowerMessage.includes('schedule')) {
      return {
        response: this.getRandomResponse(this.servicesResponses),
        isRuleBased: true
      };
    }

    return {
      response: '',
      isRuleBased: false
    };
  }
}
