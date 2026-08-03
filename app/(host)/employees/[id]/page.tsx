"use client"

import { useParams, useRouter } from "next/navigation"
import { EmployeeDetail } from "@/components/host/employees/employee-detail"
import { MOCK_EMPLOYEES } from "@/lib/mock-data"
import type { EmployeeDetailRecord } from "@/features/employees/types"

const EMPLOYEE_DETAIL_OVERRIDES: Record<
  string,
  Omit<EmployeeDetailRecord, keyof (typeof MOCK_EMPLOYEES)[number]>
> = {
  "EMP-20260115-0001": {
    dateOfBirth: "12 May 1990",
    idType: "IC",
    idNumber: "900512-14-5231",
    mobile: "+60 12-345 6789",
    nationality: "Malaysian",
    gender: "Male",
    residencyStatus: "Local",
    isProbation: false,
    probationEndDate: "12 Jan 2024",
    dependents: [],
  },
  "EMP-20260115-0002": {
    dateOfBirth: "18 Aug 1992",
    idType: "Passport",
    idNumber: "A45823917",
    mobile: "+60 12-555 1842",
    nationality: "Malaysian",
    gender: "Female",
    residencyStatus: "Local",
    isProbation: false,
    probationEndDate: "05 Jun 2026",
    dependents: [
      {
        id: "dep_0002_1",
        relationship: "Spouse",
        name: "Daniel Wilson",
        email: "daniel.wilson@email.com",
        phone: "+60 12-555 1843",
      },
      {
        id: "dep_0002_2",
        relationship: "Child",
        name: "Emma Wilson",
        email: "",
        phone: "+60 12-555 1844",
      },
    ],
  },
  "EMP-20260115-0003": {
    dateOfBirth: "09 Sep 1996",
    idType: "IC",
    idNumber: "960909-08-3812",
    mobile: "+60 12-610 1452",
    nationality: "Malaysian",
    gender: "Male",
    residencyStatus: "Local",
    isProbation: false,
    probationEndDate: "20 Aug 2026",
    dependents: [
      {
        id: "dep_0003_1",
        relationship: "Spouse",
        name: "Siti Rahmah",
        email: "siti.rahmah@email.com",
        phone: "+60 12-610 1453",
      },
      {
        id: "dep_0003_2",
        relationship: "Child",
        name: "Adam Faizal",
        email: "",
        phone: "+60 12-610 1454",
      },
    ],
  },
  "EMP-20260115-0004": {
    dateOfBirth: "04 Nov 1991",
    idType: "Passport",
    idNumber: "C99231485",
    mobile: "+60 12-600 1089",
    nationality: "Malaysian",
    gender: "Male",
    residencyStatus: "Local",
    isProbation: false,
    probationEndDate: "12 Apr 2026",
    dependents: [],
  },
  "EMP-20260115-0006": {
    dateOfBirth: "22 Feb 1988",
    idType: "IC",
    idNumber: "880222-10-4421",
    mobile: "+60 12-700 2301",
    nationality: "Malaysian",
    gender: "Male",
    residencyStatus: "Local",
    isProbation: false,
    probationEndDate: "15 Apr 2026",
    dependents: [
      {
        id: "dep_0006_1",
        relationship: "Spouse",
        name: "Nadia Faizal",
        email: "nadia.faizal@email.com",
        phone: "+60 12-700 2302",
      },
      {
        id: "dep_0006_2",
        relationship: "Child",
        name: "Aisyah Faizal",
        email: "",
        phone: "+60 12-700 2303",
      },
    ],
  },
}

const DEFAULT_EMPLOYEE_DETAILS = {
  dateOfBirth: "12 May 1990",
  idType: "IC",
  idNumber: "900512-14-5231",
  mobile: "+60 12-345 6789",
  nationality: "Malaysian",
  gender: "Male",
  residencyStatus: "Local",
  isProbation: false,
  probationEndDate: "12 Jan 2024",
  dependents: [
    {
      id: "dep_1",
      relationship: "Spouse",
      name: "Siti Rahmah",
      email: "siti.rahmah@email.com",
      phone: "+60 12-345 6790",
    },
    {
      id: "dep_2",
      relationship: "Child",
      name: "Adam Faizal",
      email: "",
      phone: "+60 12-345 6791",
    },
  ],
} satisfies Omit<EmployeeDetailRecord, keyof (typeof MOCK_EMPLOYEES)[number]>

function buildEmployeeDetail(employeeId: string): EmployeeDetailRecord {
  const baseEmployee =
    MOCK_EMPLOYEES.find((employee) => employee.id === employeeId) ??
    MOCK_EMPLOYEES[0]
  const override =
    EMPLOYEE_DETAIL_OVERRIDES[baseEmployee.id] ?? DEFAULT_EMPLOYEE_DETAILS

  return {
    ...baseEmployee,
    ...override,
  }
}

export default function EmployeePage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string
  const employee = buildEmployeeDetail(employeeId)

  return (
    <div className="p-6 pb-12 lg:p-8">
      <EmployeeDetail
        employee={employee}
        onEdit={() => router.push(`/employees/${employeeId}/edit`)}
      />
    </div>
  )
}
