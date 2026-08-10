import type {
  Member,
  MemberActivityEntry,
  MemberActivityType,
} from "@/features/users/types"

const VOUCHERS = [
  "Wellness Allocation Voucher",
  "Lifestyle Pocket Voucher",
  "Mental Wellness Voucher",
]

const REDEMPTIONS = [
  { service: "Gym Session", provider: "PrimeFit Gym & Studio" },
  { service: "Yoga Class", provider: "Zenith Yoga Studio" },
  { service: "Dietary Consultation", provider: "Luminary Nutrition Hub" },
  { service: "Meditation Class", provider: "Nova Mindfulness Studio" },
]

const PROFILE_EDITS = [
  "Updated mobile number.",
  "Updated home address.",
  "Added a payout bank account.",
  "Updated emergency contact.",
]

type ActivitySpec = Omit<MemberActivityEntry, "id" | "memberId">

/** Newest first — the timeline renders entries in array order. */
function buildSpecs(member: Member, index: number): ActivitySpec[] {
  // Invited but never signed in: the invite is the only thing that happened.
  if (member.status === "Pending") {
    return [
      {
        type: "Signup",
        title: "Invite Sent",
        description: `Invited to join ${member.organization.name} on the app. Signup not completed.`,
        timestamp: member.joinedDate,
      },
    ]
  }

  const voucher = VOUCHERS[index % VOUCHERS.length]!
  const redemption = REDEMPTIONS[index % REDEMPTIONS.length]!
  const profileEdit = PROFILE_EDITS[index % PROFILE_EDITS.length]!
  const deviceLabel = member.device
    ? `${member.device.model} (${member.device.os})`
    : "an unrecognised device"

  const specs: ActivitySpec[] = [
    {
      type: "Login",
      title: "Logged In",
      description: `Signed in from ${deviceLabel}.`,
      timestamp: member.lastActive,
    },
    {
      type: "VoucherRedeemed",
      title: "Redeemed Voucher",
      description: `${voucher} redeemed for ${redemption.service} at ${redemption.provider}.`,
      timestamp: `0${(index % 8) + 1} Apr 2026, 09:${String(10 + index * 5).padStart(2, "0")}`,
    },
    {
      type: "VoucherPurchased",
      title: "Purchased Voucher",
      description: `${voucher} purchased from the app wallet.`,
      timestamp: `0${(index % 7) + 1} Apr 2026, 16:${String(5 + index * 4).padStart(2, "0")}`,
    },
    {
      type: "ProfileUpdated",
      title: "Updated Profile",
      description: profileEdit,
      timestamp: `2${(index % 8) + 1} Mar 2026, 11:${String(20 + index * 3).padStart(2, "0")}`,
    },
    {
      type: "Signup",
      title: "Signed Up",
      description: `Completed app signup as ${member.type.toLowerCase()} of ${member.organization.name}.`,
      timestamp: member.joinedDate,
    },
  ]

  // Deactivated members stopped short of the most recent login.
  return member.status === "Inactive" ? specs.slice(1) : specs
}

export function createMemberActivity(
  member: Member,
  index: number
): MemberActivityEntry[] {
  return buildSpecs(member, index).map((spec, i) => ({
    id: `${member.id}-ACT-${String(i + 1).padStart(2, "0")}`,
    memberId: member.id,
    ...spec,
  }))
}

export function createAllMemberActivity(
  members: Member[]
): MemberActivityEntry[] {
  return members.flatMap((member, i) => createMemberActivity(member, i))
}

export type { MemberActivityType }
