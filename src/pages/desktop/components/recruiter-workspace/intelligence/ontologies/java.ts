/**
 * Resume Intelligence OS v3.0 — Java Ontology
 */
import type { OntologyModule } from './registry';

export const javaOntology: OntologyModule = {
  id: 'java', displayName: 'Java Ecosystem', version: '1.0.0',
  entries: [
    { canonical: 'Java', aliases: ['Core Java', 'Java SE', 'Java EE', 'J2EE', 'JDK'], parentCategory: 'Programming Language', grandparentCategory: 'Software Engineering', skillType: 'TechnicalSkill', taxonomy: ['Software Engineering', 'Programming Language', 'Java'] },
    { canonical: 'Spring Boot', aliases: ['SpringBoot', 'Spring-Boot', 'Spring Boot Framework'], parentCategory: 'Java Framework', grandparentCategory: 'Java', skillType: 'TechnicalSkill', taxonomy: ['Software Engineering', 'Java', 'Frameworks', 'Spring', 'Spring Boot'] },
    { canonical: 'Spring Framework', aliases: ['Spring', 'Spring MVC', 'Spring Core', 'Spring IoC'], parentCategory: 'Java Framework', grandparentCategory: 'Java', skillType: 'TechnicalSkill', taxonomy: ['Software Engineering', 'Java', 'Frameworks', 'Spring'] },
    { canonical: 'Hibernate', aliases: ['JPA', 'Java Persistence API', 'Hibernate ORM'], parentCategory: 'Java Framework', grandparentCategory: 'Java', skillType: 'TechnicalSkill', taxonomy: ['Software Engineering', 'Java', 'ORM', 'Hibernate'] },
    { canonical: 'Apache Kafka', aliases: ['Kafka', 'Kafka Streams', 'Event Streaming'], parentCategory: 'Messaging', grandparentCategory: 'Backend', skillType: 'TechnicalSkill', taxonomy: ['Software Engineering', 'Messaging', 'Event-Driven', 'Kafka'] },
    { canonical: 'Maven', aliases: ['Apache Maven', 'POM', 'Maven Build'], parentCategory: 'Build Tool', grandparentCategory: 'Java', skillType: 'ToolSkill', taxonomy: ['Software Engineering', 'Java', 'Build Tools', 'Maven'] },
    { canonical: 'Gradle', aliases: ['Gradle Build', 'Gradle DSL'], parentCategory: 'Build Tool', grandparentCategory: 'Java', skillType: 'ToolSkill', taxonomy: ['Software Engineering', 'Java', 'Build Tools', 'Gradle'] },
    { canonical: 'Microservices', aliases: ['Microservice Architecture', 'MSA', 'Microservices Architecture'], parentCategory: 'Architecture', grandparentCategory: 'Software Engineering', skillType: 'DomainSkill', taxonomy: ['Software Engineering', 'Architecture', 'Microservices'] },
    { canonical: 'REST API', aliases: ['RESTful API', 'REST', 'RESTful Services', 'REST Web Services'], parentCategory: 'API Design', grandparentCategory: 'Backend', skillType: 'TechnicalSkill', taxonomy: ['Software Engineering', 'API', 'REST API'] },
    { canonical: 'JUnit', aliases: ['JUnit 5', 'Unit Testing Java', 'JUnit Testing'], parentCategory: 'Testing', grandparentCategory: 'Java', skillType: 'ToolSkill', taxonomy: ['Software Engineering', 'Java', 'Testing', 'JUnit'] },
    { canonical: 'Apache Tomcat', aliases: ['Tomcat', 'Tomcat Server', 'Web Container'], parentCategory: 'Application Server', grandparentCategory: 'Java', skillType: 'PlatformSkill', taxonomy: ['Software Engineering', 'Java', 'Application Server', 'Tomcat'] },
    { canonical: 'Java Multithreading', aliases: ['Concurrency', 'Java Threads', 'ExecutorService'], parentCategory: 'Java Advanced', grandparentCategory: 'Java', skillType: 'TechnicalSkill', taxonomy: ['Software Engineering', 'Java', 'Concurrency'] },
    { canonical: 'Spring Security', aliases: ['Security Spring', 'OAuth2 Spring', 'JWT Spring'], parentCategory: 'Java Framework', grandparentCategory: 'Java', skillType: 'TechnicalSkill', taxonomy: ['Software Engineering', 'Java', 'Security', 'Spring Security'] },
    { canonical: 'Spring Cloud', aliases: ['Spring Microservices', 'Cloud Native Java'], parentCategory: 'Java Framework', grandparentCategory: 'Java', skillType: 'TechnicalSkill', taxonomy: ['Software Engineering', 'Java', 'Cloud', 'Spring Cloud'] },
  ],
};
