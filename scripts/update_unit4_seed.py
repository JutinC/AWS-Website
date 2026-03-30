#!/usr/bin/env python3
"""Replace Unit 4 rows in seed.sql with new content."""
import re

UNIT4_NEW = [
    (4, 'Unit 4 – AWS Cloud Security', """AWS Unit 4 focuses on how security works in the cloud and how organizations protect their systems, data, and users. Security is one of the most important parts of cloud computing because everything—from applications to sensitive data—is hosted online.

AWS provides built-in tools and best practices to help secure cloud environments. However, security is not handled entirely by AWS. Instead, AWS uses a shared responsibility model, where both AWS and the customer play a role in keeping systems secure.""", '', 0, 1),
    (4, 'AWS Shared Responsibility Model', """The AWS Shared Responsibility Model defines how security duties are divided between AWS and the user.

AWS is responsible for security OF the cloud, which includes:

- Physical data centers
- Hardware and networking infrastructure
- Global cloud systems

Customers are responsible for security IN the cloud, which includes:

- Managing users and permissions
- Protecting data
- Configuring services correctly
- Updating operating systems and applications

This model ensures that AWS handles the infrastructure, but users must properly secure their own resources.""", '', 1, 0),
    (4, 'AWS Identity and Access Management (IAM)', """AWS IAM is the main service used to control access in AWS. It allows organizations to define who can access resources and what actions they are allowed to perform.

IAM includes:

- Users – Individual identities
- Groups – Collections of users with shared permissions
- Roles – Temporary access with specific permissions
- Policies – JSON rules that define permissions

A key concept in IAM is the principle of least privilege, meaning users only get access to what they need. This reduces security risks and prevents unauthorized actions.

IAM is essential for securing AWS environments and is used in almost every service.""", '', 2, 0),
    (4, 'Securing a New AWS Account', """When creating a new AWS account, it is critical to set up security immediately to prevent unauthorized access.

Important steps include:

- Enable Multi-Factor Authentication (MFA) for the root user
- Avoid using the root account for daily tasks
- Create IAM users for regular access
- Set strong password policies
- Enable billing alerts

These steps help ensure that the account is protected from the start and reduce the risk of security breaches.""", '', 3, 0),
    (4, 'Securing AWS Accounts', """Securing AWS accounts involves managing access and monitoring activity to prevent threats.

Best practices include:

- Use IAM roles instead of sharing credentials
- Regularly rotate passwords and access keys
- Monitor login activity and API usage
- Limit permissions using least privilege
- Use security groups and network rules

Continuous monitoring and updating of security settings are important to maintain a strong security posture.""", '', 4, 0),
    (4, 'Securing Data in AWS', """Protecting data is a critical part of cloud security. AWS provides tools to secure data both at rest and in transit.

Methods include:

Encryption:
- Data at rest can be encrypted using AWS KMS
- Data in transit is protected using HTTPS and TLS

Access Control:
- IAM policies control who can access data
- Permissions prevent unauthorized usage

Backup & Recovery:
- Data can be backed up and replicated
- Helps protect against data loss

By combining encryption, access control, and backups, organizations can ensure their data remains secure.""", '', 5, 0),
    (4, 'Monitoring & Security Tools', """AWS provides several services to monitor and detect security threats.

Key tools include:

- AWS CloudTrail – Tracks user activity and API calls
- Amazon CloudWatch – Monitors performance and triggers alerts
- Amazon GuardDuty – Detects threats using machine learning
- AWS Security Hub – Centralizes security alerts

These tools help organizations detect unusual behavior and respond quickly to potential threats.""", '', 6, 0),
    (4, 'Working to Ensure Compliance', """Compliance means following laws, regulations, and security standards required for handling data.

AWS supports compliance by:

- Providing secure infrastructure
- Offering certifications (HIPAA, SOC, ISO, etc.)
- Giving tools for auditing and monitoring

Organizations are responsible for:

- Configuring services correctly
- Protecting sensitive data
- Keeping records of activity

Compliance requires ongoing monitoring and regular audits to ensure standards are maintained.""", '', 7, 0),
    (4, 'Security Best Practices', """Important AWS security best practices include:

- Enable MFA for all accounts
- Use least privilege permissions
- Encrypt sensitive data
- Monitor activity continuously
- Regularly update credentials and policies

Following these practices helps reduce risks and protect cloud environments.""", '', 8, 0),
    (4, 'Unit 4 Summary', """AWS Unit 4 explains how cloud security works and how responsibilities are shared between AWS and users. While AWS secures the infrastructure, customers must secure their data, applications, and access.

Services like IAM help manage permissions, while encryption and monitoring tools protect data and detect threats. Compliance and best practices ensure systems remain secure over time.

Understanding these concepts is essential for building safe and reliable cloud systems.""", '', 9, 0),
]

def escape_sql(s):
    return str(s).replace('\\', '\\\\').replace("'", "''").replace('\n', '\\n').replace('\r', '')

def main():
    seed_path = 'database/seed.sql'
    with open(seed_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find and replace Unit 4 block - from (4, 'Unit 4... to (5, 'Unit 5...
    pattern = r"\(4, 'Unit 4[^)]+\), 0, 1\),\n\(4, '[^']+', '[^']*(?:''[^']*)*', [^,]+, 1, 0\),\n\(4, '[^']+', '[^']*(?:''[^']*)*', [^,]+, 2, 0\),\n\(4, '[^']+', '[^']*(?:''[^']*)*', [^,]+, 3, 0\),\n\(4, '[^']+', '[^']*(?:''[^']*)*', [^,]+, 4, 0\),\n\(4, '[^']+', '[^']*(?:''[^']*)*', [^,]+, 5, 0\),\n\(4, '[^']+', '[^']*(?:''[^']*)*', [^,]+, 6, 0\),\n\(4, '[^']+', '[^']*(?:''[^']*)*', [^,]+, 7, 0\),"
    
    # Simpler: match from first (4, to (5,
    unit4_start = content.find("(4, 'Unit 4 – AWS Cloud Security'")
    unit5_start = content.find("(5, 'Unit 5")
    if unit4_start == -1 or unit5_start == -1:
        print("Could not find Unit 4 or Unit 5 block")
        return
    
    before = content[:unit4_start]
    after = content[unit5_start:]
    
    new_rows = []
    for page_id, title, desc, img, order_idx, show in UNIT4_NEW:
        desc_esc = escape_sql(desc)
        title_esc = escape_sql(title)
        img_esc = escape_sql(img)
        new_rows.append(f"({page_id}, '{title_esc}', '{desc_esc}', '{img_esc}', {order_idx}, {show})")
    
    new_content = before + ',\n'.join(new_rows) + ',\n' + after
    
    with open(seed_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Updated Unit 4 with {len(UNIT4_NEW)} rows")

if __name__ == '__main__':
    main()
